import { TaskParamsType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { LucideProps, TextIcon } from "lucide-react";

export const ExtractTextFromElementTask = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Ectract Text From Element",
  icon: (props: LucideProps) => (
    <TextIcon className="stroke-red-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: "Html",
      type: TaskParamsType.STRING,
      required: true,
      variant: "textarea",
    },
    {
      name: "Selector",
      type: TaskParamsType.STRING,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "Extracted text",
      type: TaskParamsType.STRING,
    },
  ] as const,
} satisfies WorkflowTask;
