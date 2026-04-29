import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
      <p className="text-sm text-muted-foreground">
        Welcome, {user?.email}. Brand templates and projects land here in the
        next phases.
      </p>
    </div>
  );
}
