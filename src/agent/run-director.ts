import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { projects, brandTemplates } from "@/src/db/schema";
import { runDirector } from "./director";
import type { VideoManifest, BrandTemplateSnapshot } from "./schemas";

/**
 * Wraps the director: loads project + brand, runs the graph, returns the
 * manifest. Does NOT trigger renders — caller chains that. Throws if the
 * director fails to produce a valid manifest after retries.
 */
export async function runDirectorForProject(input: {
  userId: string;
  projectId: string;
}): Promise<{
  manifest: VideoManifest;
  brand: BrandTemplateSnapshot;
}> {
  const { userId, projectId } = input;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) throw new Error(`Project ${projectId} not found`);

  const [brand] = await db
    .select()
    .from(brandTemplates)
    .where(eq(brandTemplates.id, project.brandTemplateId))
    .limit(1);
  if (!brand) throw new Error(`Brand template ${project.brandTemplateId} not found`);

  const brandSnapshot: BrandTemplateSnapshot = {
    id: brand.id,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
    headingFont: brand.headingFont,
    bodyFont: brand.bodyFont,
    logoUrl: brand.logoUrl,
  };

  const finalState = await runDirector({
    userId,
    projectId,
    script: project.script,
    brandTemplate: brandSnapshot,
  });

  if (!finalState.manifest) {
    throw new Error(
      `Director failed after retries: ${finalState.errors.join("; ")}`,
    );
  }

  return { manifest: finalState.manifest, brand: brandSnapshot };
}
