"use client";

import { Input } from "@/components/ui/input";
import { TaskParams, TaskParamsType } from "@/types/task";
import StringParam from "./param/StringParam";
import { useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import { useCallback } from "react";
import BrowserInstanceParams from "./param/BrowserInstanceParams";

const NodeParamsField = ({
  param,
  nodeId,
}: {
  param: TaskParams;
  nodeId: string;
}) => {
  const { updateNodeData, getNode } = useReactFlow();
  const node = getNode(nodeId) as AppNode;
  const value = node?.data.inputs?.[param.name];

  const updateNodeParamValue = useCallback(
    (newValue: string) => {
      updateNodeData(nodeId, {
        inputs: {
          ...node?.data.inputs,
          [param.name]: newValue,
        },
      });
    },
    [nodeId, updateNodeData, param.name, node?.data.inputs]
  );

  switch (param.type) {
    case TaskParamsType.STRING:
      return (
        <StringParam
          param={param}
          value={value}
          updateNodeParamValue={updateNodeParamValue}
        />
      );

    case TaskParamsType.BROWSER_INSTANCE:
      return (
        <BrowserInstanceParams
          param={param}
          value={""}
          updateNodeParamValue={updateNodeParamValue}
        />
      );

    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground"></p>
        </div>
      );
  }
};

export default NodeParamsField;
