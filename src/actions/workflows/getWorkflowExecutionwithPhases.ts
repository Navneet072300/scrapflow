"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowExecutionWithPhases(executionId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  return prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
      userId,
    },
    include: {
      phases: {
        orderBy: {
          number: "asc",
        },
      },
    },
  });
}

// export const GetWorkflowPhaseDetails = async (phaseId: string) => {
//   const user = await getUser();
//   if (!user) {
//     throw new Error("User not found");
//   }
//   return await db.query.ExecutionPhase.findFirst({
//     where: eq(ExecutionPhase.id, Number(phaseId)),
//     with: {
//       logs: {
//         orderBy: asc(ExecutionLogs.timestamp),
//       },
//     },
//   });
// };
