import { TaskParamsType, TaskType } from "@/types/task";
import { GlobeIcon, LucideProps } from "lucide-react";

export const LaunchBrowserTask = {
  type: TaskType.LAUNCH_BROWSER,
  label: "Launch Browser",
  icon: (props: LucideProps) => (
    <GlobeIcon className="stroke-pink-400" {...props} />
  ),
  isEntryPoint: true,
  credits: 5,
  inputs: [
    {
      name: "Website Url",
      type: TaskParamsType.STRING,
      helperText: "eg : https://google.com",
      required: true,
      hideHandle: true,
    },
  ],
  outputs: [{ name: "Web Page", type: TaskParamsType.BROWSER_INSTANCE }],
};
