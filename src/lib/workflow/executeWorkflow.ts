"use server";

import "server-only";
import prisma from "../prisma";
import {
  ExecutionPhaseStatus,
  WorkflowExecutionStatus,
} from "@/types/workflow";

export async function ExecutionWorkflow(executionId: string) {
  const executionArray = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },
    include: {
      workflow: true,
      phases: true,
    },
  });
  const execution = executionArray[0];
  if (!execution) {
    throw new Error("Execution not found");
  }
  const edges = JSON.parse(execution.definition!).edges as Edge[];
  console.log(execution.phases);
  const environment: Environment = {
    phases: {},
  };
  await initializeWorkflowExecution(executionId, execution.workflowId!);
  await initializePhaseStatuses(execution);

  let creditsConsumed = 0;
  let executionFailed = false;
  for (const phase of execution.phases) {
    // const logCollector = createLogCollector();
    console.log("Executing Phase", phase.name);
    const phaseExecution = await excuteWorkflowPhase(
      phase,
      environment,
      edges,
      execution.userId!
    );

    creditsConsumed += phaseExecution.creditsConsumed;
    console.log("Phase Execution", phaseExecution);
    if (!phaseExecution.success) {
      executionFailed = true;
      break;
    }
    //TODO credit consumption
  }
  await finalizedWorkflowExecution(
    executionId,
    execution.workflowId!,
    executionFailed,
    creditsConsumed
  );
  //TODO finalize execution

  //TODO clean up environment
  await cleanupEnvironment(environment);
  // revalidatePath(`/workflow/runs`);
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string
) {
  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
    },
  });
}

async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}
async function finalizedWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: { id: executionId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });
}

async function excuteWorkflowPhase(
  phase: ExecutionPhase,
  environment: Environment,
  edges: Edge[],
  userId: number
) {
  const logCollector = createLogCollector();
  const startedAt = new Date();
  const node = JSON.parse(phase.node!) as AppNode;
  setupEnvironmentForPhase(node, environment, edges);
  await db
    .update(ExecutionPhase)
    .set({
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(environment.phases[node.id].inputs),
    })
    .where(eq(ExecutionPhase.id, phase.id));
  const creditsRequired = TaskRegistry[node.data.type].credits;
  console.log("Executing Phase", phase.name, " with credits ", creditsRequired);
  let success = await decrementCredits(userId, creditsRequired, logCollector);
  const creditsConsumed = success ? creditsRequired : 0;
  if (success) {
    success = await executePhase(phase, node, environment, logCollector);
  }
  const outputs = environment.phases[node.id].outputs;
  await finalizePhase(
    phase.id!,
    success,
    outputs,
    logCollector,
    creditsConsumed
  );
  return { success, creditsConsumed };
}

async function finalizePhase(
  phaseId: number,
  success: boolean,
  outputs: any,
  logCollector: LogCollector,
  creditsConsumed: number
) {
  console.log("Finalizing Phase", phaseId, success);
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;
  await db
    .update(ExecutionPhase)
    .set({
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
      creditsConsumed,
    })
    .where(eq(ExecutionPhase.id, phaseId));
  const logs = logCollector.getAll();
  const logInsertPromises = logs.map((log) => {
    return db.insert(ExecutionLogs).values({
      executionPhaseId: phaseId,
      logLevel: log.level,
      message: log.message,
    });
  });
  await Promise.all(logInsertPromises);
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];
  if (!runFn) {
    return false;
  }
  const executionEnvironment: ExecutionEnvironment<any> =
    createExecutionEnvironment(node, environment, logCollector);
  return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(
  node: AppNode,
  environment: Environment,
  edges: Edge[]
) {
  environment.phases[node.id] = {
    inputs: {},
    outputs: {},
  };
  const inputsDefinition = TaskRegistry[node.data.type].inputs;
  for (const input of inputsDefinition) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
    const inputValue = node.data.inputs[input.name];
    if (inputValue) {
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }
    const connectedEdge = edges.find(
      (edge) => edge.target === node.id && edge.targetHandle === input.name
    );
    if (!connectedEdge) {
      console.error("Input not connected", input.name);
      continue;
    }
    const outputValue =
      environment.phases[connectedEdge.source].outputs[
        connectedEdge.sourceHandle!
      ];
    environment.phases[node.id].inputs[input.name] = outputValue;
  }
}
function createExecutionEnvironment(
  node: AppNode,
  environment: Environment,
  logCollector: LogCollector
): ExecutionEnvironment<any> {
  return {
    getInput(name: string) {
      return environment.phases[node.id].inputs[name];
    },
    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => {
      environment.browser = browser;
    },
    getPage: () => environment.page,
    setPage: (page: Page) => {
      environment.page = page;
    },
    setOutputs: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },
    log: logCollector,
  };
}
async function cleanupEnvironment(environment: Environment) {
  if (environment.browser) {
    await environment.browser.close().catch((error) => {
      console.error("Error in closing browser", error);
    });
  }
}

async function decrementCredits(
  userId: number,
  credits: number,
  logCollector: LogCollector
) {
  try {
    const userBalance = await db.query.UserBalance.findFirst({
      where: eq(UserBalance.userId, userId),
    });
    if (!userBalance) {
      throw new Error("User balance not found");
    }
    await db
      .update(UserBalance)
      .set({
        credits: userBalance.credits! - credits,
      })
      .where(eq(UserBalance.userId, userId));
    return true;
  } catch (error) {
    console.error("Error in decrementing credits", error);
    logCollector.error("Insufficient balance");
    return false;
  }
}
