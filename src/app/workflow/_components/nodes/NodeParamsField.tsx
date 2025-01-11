"use client";

import { Input } from "@/components/ui/input";
import { TaskParams, TaskParamsType } from "@/types/task";
import StringParam from "./param/StringParam";

const NodeParamsField = ({ param }: { param: TaskParams }) => {
  switch (param.type) {
    case TaskParamsType.STRING:
      return <StringParam param={param} />;
    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground"></p>
        </div>
      );
  }
};

export default NodeParamsField;
