import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { brandTemplates } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { Button } from "@/src/components/ui/button";
import { BrandTemplateCard } from "./brand-template-card";

export default async function BrandTemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const templates = await db
    .select()
    .from(brandTemplates)
    .where(eq(brandTemplates.userId, user.id))
    .orderBy(desc(brandTemplates.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Brand templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Reusable brand presets for your videos.
          </p>
        </div>
        <Button asChild>
          <Link href="/brand-templates/new">New template</Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-base font-medium">No templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first brand template to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href="/brand-templates/new">Create template</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <BrandTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
