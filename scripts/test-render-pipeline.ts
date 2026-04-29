#!/usr/bin/env tsx
/**
 * Phase 5 acceptance test — runs the real render pipeline end-to-end.
 *
 * Usage:
 *   pnpm tsx scripts/test-render-pipeline.ts <user-id> [project-id]
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { brandTemplates, projects } from "../src/db/schema";
import { triggerLocalRender } from "../src/render/trigger-local";
import type {
  VideoManifest,
  BrandTemplateSnapshot,
} from "../src/agent/schemas";

async function main() {
  const userId = process.argv[2];
  let projectId = process.argv[3];

  if (!userId) {
    console.error("Usage: pnpm tsx scripts/test-render-pipeline.ts <user-id> [project-id]");
    process.exit(1);
  }

  let [brand] = await db
    .select()
    .from(brandTemplates)
    .where(eq(brandTemplates.userId, userId))
    .limit(1);

  if (!brand) {
    console.log("No brand template found, seeding a temporary one...");
    const [seeded] = await db
      .insert(brandTemplates)
      .values({
        userId,
        name: "Phase 5 Test Brand",
        primaryColor: "#0F172A",
        secondaryColor: "#64748B",
        accentColor: "#3B82F6",
        headingFont: "Inter",
        bodyFont: "Inter",
        logoUrl: null,
      })
      .returning();
    if (!seeded) throw new Error("Failed to seed brand template");
    brand = seeded;
    console.log(`Seeded brand template: ${brand.id}`);
  } else {
    console.log(`Using brand template: ${brand.name} (${brand.id})`);
  }

  let createdProject = false;
  if (!projectId) {
    const [proj] = await db
      .insert(projects)
      .values({
        userId,
        brandTemplateId: brand.id,
        script: "Phase 5 integration test",
        status: "rendering",
      })
      .returning({ id: projects.id });
    if (!proj) throw new Error("Failed to create temporary project row");
    projectId = proj.id;
    createdProject = true;
    console.log(`Created temporary project: ${projectId}`);
  }

  const manifest: VideoManifest = {
    brandTemplateId: brand.id,
    totalDuration: 12,
    scenes: [
      {
        index: 0,
        text: "ReelMind",
        durationSeconds: 3,
        animation: "fade-in-text",
        emphasisColor: "accent",
        startAt: 0,
      },
      {
        index: 1,
        text: "Script in. Video out.",
        durationSeconds: 3,
        animation: "slide-up-text",
        emphasisColor: "secondary",
        startAt: 3,
      },
      {
        index: 2,
        text: "No editor needed.",
        durationSeconds: 3,
        animation: "typewriter",
        emphasisColor: "primary",
        startAt: 6,
      },
      {
        index: 3,
        text: "Architect once. Render forever.",
        durationSeconds: 3,
        animation: "logo-reveal",
        emphasisColor: "accent",
        startAt: 9,
      },
    ],
  };

  const brandSnapshot: BrandTemplateSnapshot = {
    id: brand.id,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
    accentColor: brand.accentColor,
    headingFont: brand.headingFont,
    bodyFont: brand.bodyFont,
    logoUrl: brand.logoUrl,
  };

  console.log("\nStarting 3-aspect render pipeline...");
  const started = Date.now();
  const result = await triggerLocalRender({
    userId,
    projectId,
    manifest,
    brand: brandSnapshot,
  });

  const totalSeconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nFinished in ${totalSeconds}s\n`);

  for (const row of result.renderRows) {
    const ok = row.status === "completed" ? "OK " : "FAIL";
    console.log(`[${ok}] ${row.aspectRatio} → ${row.status}`);
    if (row.videoUrl) console.log(`     URL: ${row.videoUrl.slice(0, 120)}...`);
    if (row.errorMessage) console.log(`     error: ${row.errorMessage}`);
  }

  if (createdProject) {
    console.log(`\nTemporary project left in DB: ${projectId}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
