"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { StatusPill } from "./status-pill";
import { RenderCard } from "./render-card";
import { AgentTraceViewer } from "./agent-trace-viewer";

type ProjectRow = {
  id: string;
  status: string;
  script: string;
  brandTemplateId: string;
  createdAt: string | Date;
};

type RenderRow = {
  id: string;
  aspectRatio: string;
  status: string;
  videoUrl: string | null;
  errorMessage: string | null;
  createdAt: string | Date;
};

type TraceRow = {
  id: string;
  nodeName: string;
  llmCall: boolean | null;
  tokensUsed: number | null;
  durationMs: number | null;
  inputState: unknown;
  outputState: unknown;
  error: string | null;
  createdAt: string | Date;
};

type StatusResponse = {
  project: ProjectRow;
  renders: RenderRow[];
  traces: TraceRow[];
};

const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export function ProjectDetail({
  projectId,
  initialProject,
}: {
  projectId: string;
  initialProject: ProjectRow;
}) {
  const { data, error, isLoading } = useQuery<StatusResponse>({
    queryKey: ["project-status", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.project.status;
      return status && TERMINAL_STATUSES.has(status) ? false : 2000;
    },
    initialData: () => ({
      project: initialProject,
      renders: [],
      traces: [],
    }),
  });

  if (isLoading && !data) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-destructive">
        Failed to load: {error instanceof Error ? error.message : "unknown"}
      </p>
    );
  }
  if (!data) return null;

  const { project, renders, traces } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Updates every 2 seconds while in progress.
            </p>
          </div>
          <StatusPill status={project.status} />
        </CardHeader>
        <CardContent>
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              Original script
            </summary>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
              {project.script}
            </p>
          </details>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold tracking-tight">Renders</h3>
        {renders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Waiting for the director to plan scenes...
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {renders.map((r) => (
              <RenderCard key={r.id} render={r} />
            ))}
          </div>
        )}
      </div>

      <AgentTraceViewer traces={traces} />
    </div>
  );
}
