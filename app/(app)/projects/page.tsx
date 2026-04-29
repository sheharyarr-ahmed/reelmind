import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { projects } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { StatusPill } from "./[id]/status-pill";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const list = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Each project produces three videos — one per aspect ratio.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">New project</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-base font-medium">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a script. The AI Director plans scenes; the pipeline renders
            three aspect ratios.
          </p>
          <Button asChild className="mt-4">
            <Link href="/projects/new">Submit your first project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="transition hover:bg-muted/30">
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">
                    {p.script.slice(0, 60)}
                    {p.script.length > 60 ? "..." : ""}
                  </CardTitle>
                  <StatusPill status={p.status} />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
