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

export type WorkflowExecutionPlan = {
  phase: number;
  nodes: AppNode[];
}[];
