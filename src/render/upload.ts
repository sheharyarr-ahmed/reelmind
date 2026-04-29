import { readFile } from "node:fs/promises";
import { getAdminClient } from "@/src/lib/supabase/admin";

const RENDERS_BUCKET = "renders";
const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type UploadArgs = {
  userId: string;
  projectId: string;
  aspectRatio: string;
  filePath: string;
};

export type UploadResult = {
  storagePath: string;
  signedUrl: string;
  expiresAt: Date;
};

export async function uploadRenderToStorage(
  args: UploadArgs,
): Promise<UploadResult> {
  const { userId, projectId, aspectRatio, filePath } = args;
  const supabase = getAdminClient();

  const storagePath = `${userId}/${projectId}/${aspectRatio}.mp4`;
  const fileBuffer = await readFile(filePath);

  const { error: uploadErr } = await supabase.storage
    .from(RENDERS_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });
  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`);
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(RENDERS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (signErr || !signed) {
    throw new Error(`Signed URL mint failed: ${signErr?.message ?? "unknown"}`);
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000);

  return {
    storagePath,
    signedUrl: signed.signedUrl,
    expiresAt,
  };
}
