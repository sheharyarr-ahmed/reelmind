import { cn } from "@/src/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
  directing: {
    label: "Director planning",
    className: "bg-blue-100 text-blue-900",
  },
  rendering: {
    label: "Rendering 3 aspects",
    className: "bg-amber-100 text-amber-900",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-900",
  },
  failed: { label: "Failed", className: "bg-red-100 text-red-900" },
};

export function StatusPill({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        style.className,
      )}
    >
      {style.label}
    </span>
  );
}
