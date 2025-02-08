"use server";

import { db } from "@/db";
import {
  ExecutionPhase,
  workflowExecutionTable,
  workflowTable,
} from "@/db/schema";
import { getUser } from "@/lib/sessions";
import { ExecutionWorkflow } from "@/lib/workflow/executionWorkflow";
import { FlowExecutionPlan } from "@/lib/workflow/FlowExecutionPlan";
import { TaskRegistry } from "@/lib/workflow/task/Registry";
import {
  ExecutionPhaseStatus,
  ExecutionStatus,
  WorkFlowExecutionPlan,
  WorkflowExecutionTrigger,
  WorkflowStatus,
} from "@/types/workflow";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { permanentRedirect, redirect } from "next/navigation";

export async function RunWorkFlow(form: {
  workflowId: number;
  flowDefinition?: string;
}) {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  const { workflowId, flowDefinition } = form;
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }
  const workflow = await db.query.workflowTable.findFirst({
    where: eq(workflowTable.id, workflowId),
  });

  if (!flowDefinition) {
    throw new Error("Flow Definition is not defined");
  }
  const flow = JSON.parse(flowDefinition);
  const result = FlowExecutionPlan(flow.nodes, flow.edges);
  if (result.error) {
    throw new Error("Invalid Flow Definition");
  }
  if (!result.executionPlan) {
    throw new Error("Execution Plan not found");
  }
  const executionPlan = result.executionPlan;
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
