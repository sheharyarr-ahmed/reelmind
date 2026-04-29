"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/src/db";
import { brandTemplates } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { FONT_WHITELIST } from "@/src/lib/fonts";

const HEX = /^#[0-9a-fA-F]{6}$/;

const brandTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  primaryColor: z.string().regex(HEX, "Must be a hex color like #1a2b3c"),
  secondaryColor: z.string().regex(HEX, "Must be a hex color like #1a2b3c"),
  accentColor: z.string().regex(HEX, "Must be a hex color like #1a2b3c"),
  headingFont: z.enum(FONT_WHITELIST as unknown as [string, ...string[]]),
  bodyFont: z.enum(FONT_WHITELIST as unknown as [string, ...string[]]),
  logoUrl: z.string().url().nullable(),
});

export type BrandTemplateInput = z.infer<typeof brandTemplateSchema>;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function createBrandTemplate(input: BrandTemplateInput) {
  const user = await requireUser();
  const parsed = brandTemplateSchema.parse(input);

  await db.insert(brandTemplates).values({
    userId: user.id,
    name: parsed.name,
    primaryColor: parsed.primaryColor,
    secondaryColor: parsed.secondaryColor,
    accentColor: parsed.accentColor,
    headingFont: parsed.headingFont,
    bodyFont: parsed.bodyFont,
    logoUrl: parsed.logoUrl,
  });

  revalidatePath("/brand-templates");
}

export async function updateBrandTemplate(
  id: string,
  input: BrandTemplateInput,
) {
  const user = await requireUser();
  const parsed = brandTemplateSchema.parse(input);

  await db
    .update(brandTemplates)
    .set({
      name: parsed.name,
      primaryColor: parsed.primaryColor,
      secondaryColor: parsed.secondaryColor,
      accentColor: parsed.accentColor,
      headingFont: parsed.headingFont,
      bodyFont: parsed.bodyFont,
      logoUrl: parsed.logoUrl,
      updatedAt: new Date(),
    })
    .where(
      and(eq(brandTemplates.id, id), eq(brandTemplates.userId, user.id)),
    );

  revalidatePath("/brand-templates");
  revalidatePath(`/brand-templates/${id}/edit`);
}

export async function deleteBrandTemplate(id: string) {
  const user = await requireUser();

  await db
    .delete(brandTemplates)
    .where(
      and(eq(brandTemplates.id, id), eq(brandTemplates.userId, user.id)),
    );

  revalidatePath("/brand-templates");
}

export async function getLogoUploadUrl(templateId: string, ext: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const path = `${user.id}/${templateId}/logo.${ext}`;
  const { data, error } = await supabase.storage
    .from("logos")
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create upload URL");
  }

  const { data: publicUrl } = supabase.storage.from("logos").getPublicUrl(path);

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicUrl.publicUrl,
  };
}
