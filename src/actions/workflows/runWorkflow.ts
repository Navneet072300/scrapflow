"use server";

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { WorkflowExecutionPlan } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";

export async function RunWorkFlow(form: {
  workflowId: string;
  flowDefinition?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  const { workflowId, flowDefinition } = form;
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }
  const workflow = await prisma.workflow.findUnique({
    where: {
      userId,
      id: workflowId,
    },
  });
  if (!workflow) {
    throw new Error("Workflow not found");
  }
  let executionPlan: WorkflowExecutionPlan;
  if (!flowDefinition) {
    throw new Error("Flow Definition is not defined");
  }
  const flow = JSON.parse(flowDefinition);
  const result = FlowToExecutionPlan(flow.nodes, flow.edges);
  if (result.error) {
    throw new Error("Invalid Flow Definition");
  }
  if (!result.executionPlan) {
    throw new Error("Execution Plan not found");
  }
  executionPlan = result.executionPlan;
  console.log("Execution Plan", executionPlan);

  const execution = await db
    .insert(workflowExecutionTable)
    .values({
      workflowId,
      userId: user.id!,
      trigger: WorkflowExecutionTrigger.MANUAL,
      status: ExecutionStatus.PENDING,
      startedAt: new Date(),
      definition: flowDefinition || "{}",
    })
    .returning({
      id: workflowExecutionTable.id,
    });

  if (!execution) {
    throw new Error("Execution not created");
  }

  // Create all phases sequentially
  for (const phase of executionPlan) {
    const phasePromises = phase.nodes.map((node) =>
      db
        .insert(ExecutionPhase)
        .values({
          userId: user.id!,
          executionId: execution[0].id,
          number: phase.phase,
          node: JSON.stringify(node),
          name: TaskRegistry[node.data.type].label,
          status: ExecutionPhaseStatus.CREATED,
        })
        .returning({
          id: ExecutionPhase.id,
        })
    );

    await Promise.all(phasePromises);
  }

  // Start the execution after all phases are created
  ExecutionWorkflow(execution[0].id.toString());

  redirect(`/workflow/runs/${workflowId}/${execution[0].id}`);
}
