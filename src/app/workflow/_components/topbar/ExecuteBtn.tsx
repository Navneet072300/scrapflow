"use client";

import { RunWorkFlow } from "@/actions/workflows/runWorkflow";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import React from "react";
import { toast } from "sonner";

export default function ExecuteBtn({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  const { toObject } = useReactFlow();
  const mutation = useMutation({
    mutationFn: RunWorkFlow,
    onSuccess: () => {},
    onError: (err) => {
      if (err instanceof Error && err instanceof isRedirectError) {
        console.error(err);
        toast.error("Something went wrong", {
          id: "flow-execution",
        });
      }
      toast.success("Workflow execution started", { id: "flow-execution" });
    },
  });

  return (
    <Button
      variant={"outline"}
      disabled={mutation.isLoading}
      onClick={() => {
        const plan = generate();
        if (!plan) {
          return;
        }

        mutation.mutate({
          workflowId,
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
      className="flex items-center gap-2"
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Execute
    </Button>
  );
}
