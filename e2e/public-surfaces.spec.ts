import { test, expect } from "@playwright/test";

/**
 * Public-surface smoke test. The full happy path (sign in → create brand
 * template → submit project → poll until complete) requires bypassing the
 * Supabase magic-link flow, which means generating a session via the admin
 * API in test setup. That work is deferred — when implemented, the bypass
 * helper goes in e2e/helpers/auth.ts and uses SUPABASE_SERVICE_ROLE_KEY
 * to mint a session for a dedicated test user.
 *
 * For v1.0 this suite proves the public surfaces render and the auth
 * guard kicks in on protected routes.
 */

test("landing page renders the hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /architect once\. render forever\./i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  // Demo video element is present
  await expect(page.locator("video")).toHaveAttribute("src", "/demos/demo.mp4");
});

test("login page renders the magic-link form", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: /reelmind/i }),
  ).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send magic link/i }),
  ).toBeVisible();
});

test("dashboard redirects to /login when unauthenticated", async ({ page }) => {
  const response = await page.goto("/dashboard");
  // Auth guard redirects to /login
  expect(page.url()).toContain("/login");
  expect(response?.status()).toBeLessThan(400);
});

test("brand-templates redirects to /login when unauthenticated", async ({
  page,
}) => {
  await page.goto("/brand-templates");
  expect(page.url()).toContain("/login");
});

test("projects redirects to /login when unauthenticated", async ({ page }) => {
  await page.goto("/projects");
  expect(page.url()).toContain("/login");
});
