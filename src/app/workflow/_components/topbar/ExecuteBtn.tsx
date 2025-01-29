"use client";

import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function ExecuteBtn({ workflowId }: { workflowId: string }) {
  const { toObject } = useReactFlow();

  const saveMutation = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Flow saved successfully", { id: "workflowId" });
    },
    onError: () => {
      toast.error("Something went wrong", { id: "workflowId" });
    },
  });

  return (
    <Button
      disabled={saveMutation.isLoading}
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={() => {
        const workflowDefination = JSON.stringify(toObject());
        toast.loading("Saving workflow...", { id: "workflowId" });
        saveMutation.mutate({
          id: workflowId,
          definition: workflowDefination,
        });
      }}
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Save
    </Button>
  );
}
