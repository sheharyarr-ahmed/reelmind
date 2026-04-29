"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

type Trace = {
  id: string;
  nodeName: string;
  llmCall: boolean | null;
  tokensUsed: number | null;
  durationMs: number | null;
  inputState: unknown;
  outputState: unknown;
  error: string | null;
};

export function AgentTraceViewer({ traces }: { traces: Trace[] }) {
  const [expanded, setExpanded] = useState(false);

  if (traces.length === 0) {
    return null;
  }

  const totalTokens = traces.reduce((acc, t) => acc + (t.tokensUsed ?? 0), 0);
  const totalMs = traces.reduce((acc, t) => acc + (t.durationMs ?? 0), 0);
  const llmCalls = traces.filter((t) => t.llmCall).length;

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <CardTitle>Agent trace</CardTitle>
          <span className="text-xs text-muted-foreground">
            {expanded ? "▼" : "▶"} {traces.length} nodes · {llmCalls} LLM calls ·{" "}
            {totalTokens.toLocaleString()} tokens · {totalMs}ms
          </span>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {traces.map((trace) => (
            <TraceRow key={trace.id} trace={trace} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function TraceRow({ trace }: { trace: Trace }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
      >
        <span className="font-medium">
          {open ? "▼" : "▶"} {trace.nodeName}
          {trace.llmCall && (
            <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-900">
              LLM
            </span>
          )}
          {trace.error && (
            <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-900">
              error
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {trace.durationMs}ms
          {trace.tokensUsed ? ` · ${trace.tokensUsed} tok` : ""}
        </span>
      </button>
      {open && (
        <div className="border-t bg-muted/30 px-3 py-2 text-xs">
          {trace.error && (
            <div className="mb-2 text-destructive">error: {trace.error}</div>
          )}
          <details>
            <summary className="cursor-pointer text-muted-foreground">
              input
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto rounded bg-background p-2">
              {JSON.stringify(trace.inputState, null, 2)}
            </pre>
          </details>
          <details className="mt-2">
            <summary className="cursor-pointer text-muted-foreground">
              output
            </summary>
            <pre className="mt-1 max-h-48 overflow-auto rounded bg-background p-2">
              {JSON.stringify(trace.outputState, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
