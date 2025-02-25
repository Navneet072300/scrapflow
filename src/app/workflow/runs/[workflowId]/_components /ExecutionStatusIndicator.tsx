import { cn } from "@/lib/utils";
import { ExecutionPhaseStatus, ExecutionStatus } from "@/types/workflow";
import React from "react";

const indicatorColors: Record<ExecutionStatus, string> = {
  PENDING: "bg-slate-400",
  RUNNING: "bg-yellow-400",
  COMPLETED: "bg-emerald-400",
  FAILED: "bg-red-400",
};

const ExecutionStatusIndicator = ({ status }: { status: ExecutionStatus }) => {
  return <div className={cn("size-2 rounded-full", indicatorColors[status])} />;
};

export default ExecutionStatusIndicator;
