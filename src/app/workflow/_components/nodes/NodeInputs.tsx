import { cn } from "@/lib/utils";
import { TaskParams } from "@/types/task";
import { Handle, Position, useEdges } from "@xyflow/react";
import { ReactNode } from "react";
import NodeParamsField from "./NodeParamsField";
import { ColorForHandle } from "./common";
import { useFlowValidation } from "@/components/hooks/useFlowValidation";

export function NodeInputs({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y gap-2">{children}</div>;
}

export function NodeInput({
  input,
  nodeId,
}: {
  input: TaskParams;
  nodeId: string;
}) {
  const edges = useEdges();
  const { invalidInputs } = useFlowValidation();

  const hasErrors = invalidInputs
    .find((i) => i.nodeId === nodeId)
    ?.inputs.find((i) => i === input.name);

  const isConnected = edges.some(
    (edge) => edge.target === nodeId && edge.targetHandle === input.name
  );

  return (
    <div
      className={cn(
        "flex justify-start relative p-3 bg-secondary w-full",
        hasErrors && "bg-destructive/30"
      )}
    >
      <NodeParamsField param={input} nodeId={nodeId} disabled={isConnected} />
      {!input.hideHandle && (
        <Handle
          id={input.name}
          isConnectable={!isConnected}
          type="target"
          position={Position.Left}
          className={cn(
            "!bg-muted-foreground !border-2 !border-background !-left-2 !w-4 !h-4",
            ColorForHandle[input.type]
          )}
        />
      )}
    </div>
  );
}
