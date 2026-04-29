"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/src/db";
import { projects } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { runDirectorForProject } from "@/src/agent/run-director";
import { triggerLocalRender } from "@/src/render/trigger-local";

const newProjectSchema = z.object({
  brandTemplateId: z.string().uuid(),
  script: z.string().min(20, "Script must be at least 20 characters").max(5000),
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Background pipeline: director → render. Runs after the server action returns
 * via `void` so the user gets an immediate redirect. Errors are caught and
 * persisted to the project row so the UI can render an error state.
 */
async function runPipeline(userId: string, projectId: string): Promise<void> {
  try {
    await db
      .update(projects)
      .set({ status: "directing", updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    const { manifest, brand } = await runDirectorForProject({
      userId,
      projectId,
    });

    await db
      .update(projects)
      .set({ status: "rendering", updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    const result = await triggerLocalRender({
      userId,
      projectId,
      manifest,
      brand,
    });

    const allOk = result.renderRows.every((r) => r.status === "completed");
    await db
      .update(projects)
      .set({
        status: allOk ? "completed" : "failed",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Pipeline failed for project ${projectId}:`, message);
    await db
      .update(projects)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .catch(() => {});
  }
}

export type CreateProjectResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string };

export async function createProject(input: {
  brandTemplateId: string;
  script: string;
}): Promise<CreateProjectResult> {
  const user = await requireUser();

  const parsed = newProjectSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid input" };
  }

  const [project] = await db
    .insert(projects)
    .values({
      userId: user.id,
      brandTemplateId: parsed.data.brandTemplateId,
      script: parsed.data.script,
      status: "queued",
    })
    .returning({ id: projects.id });

  if (!project) {
    return { ok: false, error: "Failed to create project" };
  }

  // Fire-and-forget. Vercel ends serverless functions when the response
  // ships, so this pattern works in dev (Node stays alive) but production
  // should swap in Inngest. See docs/SCALING.md.
  void runPipeline(user.id, project.id);

  revalidatePath("/projects");
  return { ok: true, projectId: project.id };
}

export async function deleteProject(id: string): Promise<void> {
  const user = await requireUser();
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)));
  revalidatePath("/projects");
}
