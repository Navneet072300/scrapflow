import { TaskParamsType, TaskType } from "@/types/task";
import { LucideProps, TextIcon } from "lucide-react";

export const ExtractTextFromElementTask = {
  type: TaskType.EXTRACT_TEXT_FROM_ELEMENT,
  label: "Ectract Text From Element",
  icon: (props: LucideProps) => (
    <TextIcon className="stroke-red-400" {...props} />
  ),
  isEntryPoint: false,
  inputs: [
    {
      name: "Html",
      type: TaskParamsType.STRING,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamsType.STRING,
      required: true,
    },
  ],
  outputs: [
    {
      name: "Extracted text",
      type: TaskParamsType.STRING,
    },
  ],
};
