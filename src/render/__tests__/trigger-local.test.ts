import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module so trigger-local doesn't try to talk to Postgres.
const insertReturning = vi.fn();
const updateWhere = vi.fn();

vi.mock("@/src/db", () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: insertReturning,
      }),
    }),
    update: () => ({
      set: () => ({
        where: updateWhere,
      }),
    }),
  },
}));

import { triggerLocalRender } from "../trigger-local";
import type {
  VideoManifest,
  BrandTemplateSnapshot,
} from "@/src/agent/schemas";

const TEST_USER = "11111111-1111-1111-1111-111111111111";
const TEST_PROJECT = "22222222-2222-2222-2222-222222222222";

const SAMPLE_BRAND: BrandTemplateSnapshot = {
  id: "33333333-3333-3333-3333-333333333333",
  primaryColor: "#0F172A",
  secondaryColor: "#64748B",
  accentColor: "#3B82F6",
  headingFont: "Inter",
  bodyFont: "Inter",
  logoUrl: null,
};

const SAMPLE_MANIFEST: VideoManifest = {
  brandTemplateId: SAMPLE_BRAND.id,
  totalDuration: 12,
  scenes: [
    {
      index: 0,
      text: "Scene 1",
      durationSeconds: 4,
      animation: "fade-in-text",
      emphasisColor: "primary",
      startAt: 0,
    },
    {
      index: 1,
      text: "Scene 2",
      durationSeconds: 4,
      animation: "slide-up-text",
      emphasisColor: "secondary",
      startAt: 4,
    },
    {
      index: 2,
      text: "Scene 3",
      durationSeconds: 4,
      animation: "logo-reveal",
      emphasisColor: "accent",
      startAt: 8,
    },
  ],
};

describe("triggerLocalRender — happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let nextId = 1;
    insertReturning.mockImplementation(async () => [
      { id: `00000000-0000-0000-0000-${String(nextId++).padStart(12, "0")}` },
    ]);
    updateWhere.mockResolvedValue(undefined);
  });

  it("renders 3 aspect ratios, uploads each, marks all completed", async () => {
    const spawnFn = vi.fn(async (args: { outputPath: string }) => ({
      outputPath: args.outputPath,
    }));

    const uploadFn = vi.fn(
      async (args: { aspectRatio: string }) => ({
        storagePath: `mock/${args.aspectRatio}.mp4`,
        signedUrl: `https://storage.example.com/${args.aspectRatio}.mp4?signed=1`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
    );

    const result = await triggerLocalRender({
      userId: TEST_USER,
      projectId: TEST_PROJECT,
      manifest: SAMPLE_MANIFEST,
      brand: SAMPLE_BRAND,
      spawnFn,
      uploadFn,
    });

    expect(result.renderRows).toHaveLength(3);
    expect(result.renderRows.map((r) => r.aspectRatio)).toEqual([
      "16x9",
      "9x16",
      "1x1",
    ]);
    expect(result.renderRows.every((r) => r.status === "completed")).toBe(true);
    expect(result.renderRows.every((r) => r.videoUrl !== null)).toBe(true);

    expect(spawnFn).toHaveBeenCalledTimes(3);
    expect(uploadFn).toHaveBeenCalledTimes(3);

    // First spawn was 16x9
    expect(spawnFn.mock.calls[0]?.[0]).toMatchObject({
      compositionId: "BrandedScript",
      props: expect.objectContaining({ aspectRatio: "16x9" }),
    });
  });
});

describe("triggerLocalRender — failure path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let nextId = 100;
    insertReturning.mockImplementation(async () => [
      { id: `00000000-0000-0000-0000-${String(nextId++).padStart(12, "0")}` },
    ]);
    updateWhere.mockResolvedValue(undefined);
  });

  it("marks aspect failed when spawn throws, continues other aspects", async () => {
    const spawnFn = vi
      .fn()
      .mockResolvedValueOnce({ outputPath: "/tmp/ok-16x9.mp4" })
      .mockRejectedValueOnce(new Error("Render failed: codec unavailable"))
      .mockResolvedValueOnce({ outputPath: "/tmp/ok-1x1.mp4" });

    const uploadFn = vi.fn(async (args: { aspectRatio: string }) => ({
      storagePath: `mock/${args.aspectRatio}.mp4`,
      signedUrl: `https://storage.example.com/${args.aspectRatio}.mp4`,
      expiresAt: new Date(),
    }));

    const result = await triggerLocalRender({
      userId: TEST_USER,
      projectId: TEST_PROJECT,
      manifest: SAMPLE_MANIFEST,
      brand: SAMPLE_BRAND,
      spawnFn,
      uploadFn,
    });

    expect(result.renderRows).toHaveLength(3);
    expect(result.renderRows[0]?.status).toBe("completed");
    expect(result.renderRows[1]?.status).toBe("failed");
    expect(result.renderRows[1]?.errorMessage).toContain("codec unavailable");
    expect(result.renderRows[2]?.status).toBe("completed");

    // Upload only ran for the 2 successful renders
    expect(uploadFn).toHaveBeenCalledTimes(2);
  });
});
