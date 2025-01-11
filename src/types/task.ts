export enum TaskType {
  LAUNCH_BROWSER = "LAUNCH_BROWSER",
}
export enum TaskParamsType {
  STRING = "STRING",
}

export interface TaskParams {
  name: string;
  type: TaskParamsType;
  helperText?: string;
  required?: boolean;
  hideHandle?: boolean;
  value?: string;
  [key: string]: any;
}
