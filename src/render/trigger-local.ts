import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { renders } from "@/src/db/schema";
import type {
  VideoManifest,
  BrandTemplateSnapshot,
} from "@/src/agent/schemas";
import {
  spawnRemotionRender,
  type SpawnRenderArgs,
} from "./spawn-remotion";
import { uploadRenderToStorage } from "./upload";

const ASPECT_RATIOS = ["16x9", "9x16", "1x1"] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];

const COMPOSITION_ID = "BrandedScript";

export type TriggerLocalArgs = {
  userId: string;
  projectId: string;
  manifest: VideoManifest;
  brand: BrandTemplateSnapshot;
  /**
   * Override the spawn function. Tests pass a stub that touches an output file
   * and returns immediately; production uses the real Remotion CLI.
   */
  spawnFn?: (args: SpawnRenderArgs) => Promise<{ outputPath: string }>;
  /**
   * Override the upload function. Tests pass a stub that returns a fake URL;
   * production uses the real Storage upload.
   */
  uploadFn?: (args: {
    userId: string;
    projectId: string;
    aspectRatio: string;
    filePath: string;
  }) => Promise<{ storagePath: string; signedUrl: string; expiresAt: Date }>;
};

export type TriggerLocalResult = {
  renderRows: Array<{
    id: string;
    aspectRatio: AspectRatio;
    status: "completed" | "failed";
    videoUrl: string | null;
    errorMessage: string | null;
  }>;
};

async function renderOneAspect(
  args: TriggerLocalArgs,
  aspect: AspectRatio,
  outDir: string,
): Promise<TriggerLocalResult["renderRows"][number]> {
  const { userId, projectId, manifest, brand } = args;
  const spawnFn = args.spawnFn ?? spawnRemotionRender;
  const uploadFn = args.uploadFn ?? uploadRenderToStorage;

  // 1. Insert render row in `pending`
  const [row] = await db
    .insert(renders)
    .values({
      userId,
      projectId,
      aspectRatio: aspect,
      status: "pending",
    })
    .returning({ id: renders.id });

  if (!row) throw new Error(`Failed to insert render row for ${aspect}`);

  try {
    // 2. Mark `rendering`
    await db
      .update(renders)
      .set({ status: "rendering", updatedAt: new Date() })
      .where(eq(renders.id, row.id));

    // 3. Spawn the Remotion render
    const localFile = path.join(outDir, `${row.id}-${aspect}.mp4`);
    await spawnFn({
      compositionId: COMPOSITION_ID,
      outputPath: localFile,
      props: { manifest, brand, aspectRatio: aspect },
    });

    // 4. Upload to Storage + mint signed URL
    const upload = await uploadFn({
      userId,
      projectId,
      aspectRatio: aspect,
      filePath: localFile,
    });

    // 5. Mark `completed` and write video_url
    await db
      .update(renders)
      .set({
        status: "completed",
        videoUrl: upload.signedUrl,
        expiresAt: upload.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(renders.id, row.id));

    // 6. Cleanup local file (best-effort)
    await unlink(localFile).catch(() => {});

    return {
      id: row.id,
      aspectRatio: aspect,
      status: "completed",
      videoUrl: upload.signedUrl,
      errorMessage: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(renders)
      .set({
        status: "failed",
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(renders.id, row.id));

    return {
      id: row.id,
      aspectRatio: aspect,
      status: "failed",
      videoUrl: null,
      errorMessage: message,
    };
  }
}

export async function triggerLocalRender(
  args: TriggerLocalArgs,
): Promise<TriggerLocalResult> {
  const outDir = path.resolve(process.cwd(), "out", args.projectId);
  await mkdir(outDir, { recursive: true });

  // Sequential renders: each Remotion process saturates available cores.
  // Parallel would thrash and double total wall time on most machines.
  const rows: TriggerLocalResult["renderRows"] = [];
  for (const aspect of ASPECT_RATIOS) {
    rows.push(await renderOneAspect(args, aspect, outDir));
  }

  return { renderRows: rows };
}
