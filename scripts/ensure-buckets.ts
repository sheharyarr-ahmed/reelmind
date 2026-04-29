#!/usr/bin/env tsx
/**
 * Idempotent bucket setup. Creates 'logos' (public) and 'renders' (private)
 * buckets via the service-role admin client if they don't already exist.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const supabase = getAdminClient();

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets failed: ${listErr.message}`);

  const existing = new Set(buckets?.map((b) => b.id) ?? []);
  console.log(`Existing buckets: ${[...existing].join(", ") || "(none)"}`);

  if (!existing.has("logos")) {
    const { error } = await supabase.storage.createBucket("logos", {
      public: true,
    });
    if (error) throw new Error(`createBucket logos failed: ${error.message}`);
    console.log("Created bucket: logos (public)");
  } else {
    console.log("Bucket 'logos' already exists");
  }

  if (!existing.has("renders")) {
    const { error } = await supabase.storage.createBucket("renders", {
      public: false,
    });
    if (error) throw new Error(`createBucket renders failed: ${error.message}`);
    console.log("Created bucket: renders (private)");
  } else {
    console.log("Bucket 'renders' already exists");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
