import { NextResponse, type NextRequest } from "next/server";
import { eq, and, asc } from "drizzle-orm";
import { db } from "@/src/db";
import { projects, renders, agentTraces } from "@/src/db/schema";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const renderRows = await db
    .select()
    .from(renders)
    .where(eq(renders.projectId, id))
    .orderBy(asc(renders.aspectRatio));

  const traceRows = await db
    .select()
    .from(agentTraces)
    .where(eq(agentTraces.projectId, id))
    .orderBy(asc(agentTraces.createdAt));

  return NextResponse.json({
    project,
    renders: renderRows,
    traces: traceRows,
  });
}
