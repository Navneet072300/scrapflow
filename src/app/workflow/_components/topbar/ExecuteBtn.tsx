"use client";

import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default function ExecuteBtn({ workflowId }: { workflowId: string }) {
  const generate = useExecutionPlan();
  // const saveMutation = useMutation({
  //   mutationFn: UpdateWorkflow,
  //   onSuccess: () => {
  //     toast.success("Flow saved successfully", { id: "workflowId" });
  //   },
  //   onError: () => {
  //     toast.error("Something went wrong", { id: "workflowId" });
  //   },
  // });

  return (
    <Button
      variant={"outline"}
      className="flex items-center gap-2"
      onClick={() => {}}
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Execute
    </Button>
  );
}
