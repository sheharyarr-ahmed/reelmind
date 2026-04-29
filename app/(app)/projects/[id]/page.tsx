import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/src/db";
import { projects } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { ProjectDetail } from "./project-detail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to projects
        </Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Project
        </h2>
      </div>
      <ProjectDetail projectId={id} initialProject={project} />
    </div>
  );
}
