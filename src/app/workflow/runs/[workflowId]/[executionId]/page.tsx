import Topbar from "@/app/workflow/_components/topbar/Topbar";

import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionwithPhases";
import ExecutionViewer from "./_components/ExecutionViewer";

export default async function ExecutionViewerPage({
  params,
}: {
  params: { executionId: string; workflowId: string };
}) {
  const param = await params;
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar
        workflowId={param.workflowId}
        title="Workflow run details"
        subTitle={`Run ID: ${param.executionId}`}
        hideButtons={true}
      />
      <section className="flex h-full overflow-auto">
        <Suspense
          fallback={
            <div className="flex w-full h-full items-center justify-center">
              <Loader2Icon className="size-10 animate-spin stroke-primary" />
            </div>
          }
        >
          <ExecutionViewerWrapper executionId={param.executionId} />
        </Suspense>
      </section>
    </div>
  );
}
async function ExecutionViewerWrapper({
  executionId,
}: {
  executionId: string;
}) {
  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }
  return (
    <>
      {/* <pre>{JSON.stringify(workflowExecution, null, 4)}</pre> */}
      <ExecutionViewer execution={workflowExecution} />
    </>
  );
}
