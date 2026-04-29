import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { StatusPill } from "./status-pill";

const ASPECT_LABELS: Record<string, string> = {
  "16x9": "16:9 — Landscape",
  "9x16": "9:16 — Vertical",
  "1x1": "1:1 — Square",
};

export function RenderCard({
  render,
}: {
  render: {
    id: string;
    aspectRatio: string;
    status: string;
    videoUrl: string | null;
    errorMessage: string | null;
  };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="text-base">
          {ASPECT_LABELS[render.aspectRatio] ?? render.aspectRatio}
        </CardTitle>
        <StatusPill status={render.status} />
      </CardHeader>
      <CardContent>
        {render.videoUrl ? (
          <video
            controls
            preload="metadata"
            src={render.videoUrl}
            className="aspect-video w-full rounded-md border bg-black"
          />
        ) : render.errorMessage ? (
          <p className="text-xs text-destructive">{render.errorMessage}</p>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
            {render.status === "rendering"
              ? "Rendering..."
              : render.status === "pending"
                ? "Queued"
                : "Waiting"}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {render.videoUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={render.videoUrl} download>
              Download MP4
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
