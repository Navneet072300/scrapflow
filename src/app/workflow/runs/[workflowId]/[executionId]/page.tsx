import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { getUser } from "@/lib/sessions";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { getWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionwithPhases";
import ExecutionViewer from "./_components/ExecutionViewer";

interface Props {
  params: Promise<{
    executionId: string;
    workflowId: string;
  }>;
}
export default async function RunView({ params }: Props) {
  const param = await params;
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar
        workflowId={Number(param.workflowId)}
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
  const user = await getUser();
  if (!user) {
    return <div>unauthenticated</div>;
  }
  const workflowExecution = await getWorkflowExecutionWithPhases(executionId);
  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }
  return (
    <>
      {/* <pre>{JSON.stringify(workflowExecution, null, 4)}</pre> */}
      <ExecutionViewer initialData={workflowExecution} />
    </>
  );
}
