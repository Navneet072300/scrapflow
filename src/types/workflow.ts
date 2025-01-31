import { LucideProps } from "lucide-react";
import { TaskParams, TaskType } from "./task";
import { AppNode } from "./appNode";

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export type WorkflowTask = {
  label: string;
  icon: React.FC<LucideProps>;
  type: TaskType;
  isEntryPoint?: boolean;
  inputs: TaskParams[];
  outputs: TaskParams[];
  credits: number;
};

export type WorkFlowExecutionPlanPhase = {
  phase: number;
  nodes: AppNode[];
};
export type WorkflowExecutionPlan = WorkFlowExecutionPlanPhase[];
