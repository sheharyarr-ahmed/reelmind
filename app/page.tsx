import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { Button } from "@/src/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold">ReelMind</span>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/sheryahmedme/reelmind"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-6">
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Architect once. Render forever.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Script in. Brand-consistent video out. Three aspect ratios. No
            human editor. ReelMind is an agentic video production system —
            a 7-node LangGraph director plans scenes, a deterministic policy
            maps animations, Remotion renders the MP4s.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://github.com/sheryahmedme/reelmind"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 rounded-lg border bg-muted/20 p-2">
          <video
            controls
            preload="metadata"
            src="/demos/demo.mp4"
            className="aspect-video w-full rounded-md bg-black"
          />
          <p className="mt-2 px-2 text-xs text-muted-foreground">
            Rendered locally. The same composition runs in 16:9, 9:16, and 1:1
            from one VideoManifest.
          </p>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold">Agentic, not chatbot</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              7-node LangGraph state machine with Zod-validated tool-use,
              hard retry cap at 2, and prompt-injection defense via
              delimiters and Unicode normalization.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Deterministic where it counts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The director uses Haiku 4.5 for scene planning and Opus 4.7 for
              critique. Animations and timing are deterministic — same input,
              same output, every run.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold">Production-grade plumbing</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Supabase auth + RLS on every table, Drizzle migrations, owner-
              folder Storage policies, signed URLs, agent traces with token
              accounting, child_process renders with 5-min SIGKILL timeout.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>ReelMind by Shery Labs</span>
          <a
            href="https://github.com/sheryahmedme/reelmind"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            github.com/sheryahmedme/reelmind
          </a>
        </div>
      </footer>
    </main>
  );
}
