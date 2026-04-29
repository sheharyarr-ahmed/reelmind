import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { brandTemplates } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { Button } from "@/src/components/ui/button";
import { ProjectForm } from "./project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const templates = await db
    .select({
      id: brandTemplates.id,
      name: brandTemplates.name,
      primaryColor: brandTemplates.primaryColor,
    })
    .from(brandTemplates)
    .where(eq(brandTemplates.userId, user.id));

  if (templates.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">New project</h2>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-base font-medium">
            Create a brand template first
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Projects need a brand template to set colors and fonts.
          </p>
          <Button asChild className="mt-4">
            <Link href="/brand-templates/new">Create brand template</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to projects
        </Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          New project
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a script. The AI Director plans scenes, then renders three
          aspect ratios.
        </p>
      </div>
      <ProjectForm templates={templates} />
    </div>
  );
}
