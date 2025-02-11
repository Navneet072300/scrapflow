"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import {
  CalendarIcon,
  CircleDashedIcon,
  ClockIcon,
  CoinsIcon,
  Loader2Icon,
  LucideIcon,
  WorkflowIcon,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/getWorkflowExecutionwithPhases";

type ExecutionData = ReturnType<typeof GetWorkflowExecutionWithPhases>;
type PhaseDetails = Awaited<ReturnType<typeof GetWorkflowPhaseDetails>> & {
  logs: ExecutionLog[];
};
export default function ExecutionViewer({
  initialData,
}: {
  initialData: Awaited<ExecutionData>;
}) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["execution", initialData?.id],
    initialData,
    queryFn: () => GetWorkflowExecutionWithPhases(initialData!.id.toString()),
    refetchInterval: (queryInfo) => {
      if (
        queryInfo.state.data?.status === ExecutionStatus.RUNNING ||
        queryInfo.state.data?.status === ExecutionStatus.PENDING
      ) {
        return 1000; // Refetch every second while running
      }
      return false; // Don't refetch when not running
    },
  });
  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase],
    enabled: !!selectedPhase,
    queryFn: () => GetWorkflowPhaseDetails(selectedPhase!),
  });
  const isRunning = query.data?.status === ExecutionStatus.RUNNING;

  useEffect(() => {
    const phases = query.data?.phases || [];
    if (isRunning) {
      const phasesToSelect = phases.toSorted((a, b) =>
        a.startedAt! > b.startedAt! ? -1 : 1
      )[0];
      setSelectedPhase(phasesToSelect.id.toString());
      return;
    }
    const phaseToSelect = phases.toSorted((a, b) =>
      a.completedAt! > b.completedAt! ? -1 : 1
    )[0];
    setSelectedPhase(phaseToSelect.id.toString());
  }, [query.data?.phases, setSelectedPhase, isRunning]);

  const duration = DatesToDuration(
    query.data?.completedAt,
    query.data?.startedAt
  );
  const creditsConsumed = getPhasesTotalCost(query.data?.phases || []);
  return (
    <>
      <div className="flex w-full">
        <aside className="w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
          <div className="py-4 px-2">
            <ExecutionLabel
              icon={CircleDashedIcon}
              label="Status"
              value={
                <div className="font-semibold capitalize flex gap-2 items-center">
                  <PhaseStatusBadge
                    status={query.data?.status! as ExecutionPhaseStatus}
                  />
                  {query.data?.status}
                </div>
              }
            />
            <ExecutionLabel
              icon={CalendarIcon}
              label="Started at"
              value={
                <span className="lowercase">
                  {query.data?.startedAt
                    ? formatDistanceToNow(new Date(query.data?.startedAt), {
                        addSuffix: true,
                      })
                    : "-"}
                </span>
              }
            />
            <ExecutionLabel
              icon={ClockIcon}
              label="Duration"
              value={
                duration ? (
                  duration
                ) : (
                  <Loader2Icon size={20} className="animate-spin" />
                )
              }
            />
            <ExecutionLabel
              icon={CoinsIcon}
              label="Credits consumed"
              value={<ReactCountUpWrapper value={creditsConsumed} />}
            />
          </div>
          <Separator />
          <div className="flex justify-center items-center py-2 px-4">
            <div className="text-muted-foreground flex items-center gap-2">
              <WorkflowIcon size={20} className="stroke-muted-foreground/80" />
              <span className="font-semibold">Phases</span>
            </div>
          </div>
          <Separator />
          <div className="overflow-auto h-full px-2 space-y-2 py-4">
            {query.data?.phases.map((phase, index) => (
              <Button
                key={phase.id}
                className="w-full justify-between"
                variant={
                  selectedPhase === phase.id.toString() ? "secondary" : "ghost"
                }
                onClick={() => {
                  if (isRunning) return;
                  setSelectedPhase(phase.id.toString());
                }}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={"outline"}>{index + 1}</Badge>
                  <p className="font-semibold">{phase.name}</p>
                </div>
                <PhaseStatusBadge
                  status={phase.status! as ExecutionPhaseStatus}
                />
              </Button>
            ))}
          </div>
        </aside>
        <div className="flex w-full h-full">
          {isRunning && (
            <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
              <p className="font-bold">Run is in progress, please wait</p>
            </div>
          )}
          {!isRunning && !selectedPhase && (
            <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
              <p className="font-bold">No phase selected</p>
              <p className="text-sm text-muted-foreground">
                Select a phase to view details
              </p>
            </div>
          )}
          {!isRunning && selectedPhase && phaseDetails.isLoading && (
            <div className="flex items-center flex-col gap-2 justify-center h-full w-full">
              <Loader2Icon size={30} className="animate-spin" />
            </div>
          )}
          {!isRunning && selectedPhase && phaseDetails.data && (
            <div className="flex flex-col py-4 container gap-4 overflow-auto">
              <div className="flex gap-2 items-center">
                <Badge variant={"outline"} className="space-x-4">
                  <div className="flex gap-1 items-center">
                    <CoinsIcon size={18} className="stroke-muted-foreground" />
                    <span>Credits</span>
                  </div>
                  <span>{phaseDetails.data.creditsConsumed}</span>
                </Badge>
                <Badge variant={"outline"} className="space-x-4">
                  <div className="flex gap-1 items-center">
                    <ClockIcon size={18} className="stroke-muted-foreground" />
                    <span>Duration</span>
                  </div>
                  <span>
                    {DatesToDuration(
                      phaseDetails.data.completedAt,
                      phaseDetails.data.startedAt
                    ) || "-"}
                  </span>
                </Badge>
              </div>
              <ParameterViewer
                title="Inputs"
                subTitle="Inputs used for this phase"
                paramsJSON={phaseDetails.data.inputs}
                isLoading={phaseDetails.isLoading}
              />
              <ParameterViewer
                title="Outputs"
                subTitle="Outputs used for this phase"
                paramsJSON={phaseDetails.data.outputs}
                isLoading={phaseDetails.isLoading}
              />
              <LogViewer logs={(phaseDetails.data as PhaseDetails)?.logs} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ExecutionLabel({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="flex justify-between items-center py-2 px-4 text-sm">
      <div className="text-muted-foreground flex items-center gap-2">
        <Icon size={20} className="stroke-muted-foreground" />
        <span>{label}</span>
      </div>
      <div className="font-semibold capitalize flex gap-2 items-center">
        {value}
      </div>
    </div>
  );
}
function ParameterViewer({
  title,
  subTitle,
  paramsJSON,
  isLoading,
}: {
  title: string;
  subTitle: string;
  paramsJSON: string | null;
  isLoading?: boolean;
}) {
  const params = paramsJSON ? JSON.parse(paramsJSON) : undefined;
  return (
    <Card>
      <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-background">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {subTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-4">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2Icon size={30} className="animate-spin stroke-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {!params ||
              (Object.keys(params).length === 0 && (
                <p className="text-muted-foreground text-xsm">
                  No parameters generated by this phase
                </p>
              ))}
            {params &&
              Object.entries(params).map(([key, value]) => (
                <div
                  className="flex justify-between items-center space-y-1"
                  key={key}
                >
                  <p className="text-sm text-muted-foreground flex-1 basis-1/3">
                    {key}
                  </p>
                  <Input
                    readOnly
                    className="flex-1 basis-2/3"
                    value={value as string}
                  />
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogViewer({ logs }: { logs: ExecutionLog[] | undefined }) {
  if (!logs || logs.length === 0) {
    return null;
  }
  return (
    <Card className="w-full">
      <CardHeader className="rounded-lg rounded-b-none border-b py-4 bg-background">
        <CardTitle className="text-base">Logs</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Logs generated by this phase
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="text-muted-foreground text-sm">
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="text-muted-foreground">
                <TableCell
                  width={190}
                  className="text-xs text-muted-foreground p-[2px] pl-4"
                >
                  {log.timestamp?.toISOString()}
                </TableCell>
                <TableCell
                  width={80}
                  className={cn(
                    "uppercase text-xs font-bold p-[3px] pl-4",
                    (log.logLevel as Loglevel) === "error" &&
                      "text-destructive",
                    (log.logLevel as Loglevel) === "warning" && "text-warning",
                    (log.logLevel as Loglevel) === "info" && "text-primary"
                  )}
                >
                  {log.logLevel}
                </TableCell>
                <TableCell className="text-sm flex-1 p-[3px] pl-4">
                  {log.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
