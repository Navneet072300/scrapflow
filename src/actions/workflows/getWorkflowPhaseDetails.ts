"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// export const getWorkflowExecutionWithPhases = async (executionId: string) => {
//   const user = await getUser();
//   if (!user) {
//     throw new Error("User not found");
//   }
//   return await db.query.workflowExecutionTable.findFirst({
//     where: eq(workflowExecutionTable.id, Number(executionId)),
//     with: {
//       phases: {
//         orderBy: asc(ExecutionPhase.number),
//       },
//     },
//   });
// };

export const GetWorkflowPhaseDetails = async (phaseId: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  return prisma.executionPhase.findUnique({
    where: {
      id: phaseId,
      execution: {
        userId,
      },
    },
  });
};
