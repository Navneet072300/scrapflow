"use server";

import { db } from "@/db";
import {
  ExecutionLogs,
  ExecutionPhase,
  workflowExecutionTable,
} from "@/db/schema";
import { getUser } from "@/lib/sessions";
import { asc, eq } from "drizzle-orm";

export const getWorkflowExecutionWithPhases = async (executionId: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return await db.query.workflowExecutionTable.findFirst({
    where: eq(workflowExecutionTable.id, Number(executionId)),
    with: {
      phases: {
        orderBy: asc(ExecutionPhase.number),
      },
    },
  });
};

export const GetWorkflowPhaseDetails = async (phaseId: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return await db.query.ExecutionPhase.findFirst({
    where: eq(ExecutionPhase.id, Number(phaseId)),
    with: {
      logs: {
        orderBy: asc(ExecutionLogs.timestamp),
      },
    },
  });
};
