import { TaskParamsType, TaskType } from "@/types/task";
import { WorkflowTask } from "@/types/workflow";
import { CodeIcon, LucideProps } from "lucide-react";

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  label: "Get html from page",
  icon: (props: LucideProps) => (
    <CodeIcon className="stroke-rose-400" {...props} />
  ),
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: "Web page",
      type: TaskParamsType.BROWSER_INSTANCE,
      required: true,
    },
  ] as const,
  outputs: [
    { name: "Html", type: TaskParamsType.STRING },
    { name: "Web Page", type: TaskParamsType.BROWSER_INSTANCE },
  ] as const,
} satisfies WorkflowTask;
