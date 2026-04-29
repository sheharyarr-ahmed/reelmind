# Vercel Deploy Checklist

Phase 7 ships the codebase ready to deploy. The deploy itself needs your
Vercel + GitHub account interaction. This is the punch list.

## 1. Push the repo to GitHub

```bash
git remote add origin git@github.com:sheryahmedme/reelmind.git
git push -u origin main --tags
```

## 2. Create the Vercel project

1. Open https://vercel.com/new
2. Import the GitHub repo
3. Framework: Next.js (auto-detected)
4. Root directory: `./`
5. Build command: `pnpm build` (auto-detected)

## 3. Set environment variables

In Vercel project settings → Environment Variables, add **all** of these for
the **Production** environment:

| Variable | Source |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → API → URL |
| `SUPABASE_ANON_KEY` | Supabase dashboard → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → API → service_role |
| `SUPABASE_DB_URL` | Supabase dashboard → Database → Session pooler URL |
| `SUPABASE_DB_PASSWORD` | The DB password (plain text, no encoding) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` |
| `ANTHROPIC_API_KEY` | Anthropic console → API keys |

## 4. Update Supabase Auth redirect URLs

Add the production URL to allowed redirects:

1. Supabase dashboard → Authentication → URL Configuration
2. Site URL: `https://<your-vercel-domain>`
3. Redirect URLs: add `https://<your-vercel-domain>/**`

## 5. Known production gap — fire-and-forget pipeline

The current `runPipeline` in `app/(app)/projects/actions.ts` uses
`void runPipeline(...)` which works in `pnpm dev` because Node stays alive
between requests. Vercel ends serverless functions when the response ships,
so background work after `redirect()` may be killed mid-render.

**Two options:**

- **Quick fix:** convert `createProject` to wait for the director (~3s) and
  return after the project is queued in the database. The render itself
  still needs Inngest or similar.
- **Proper fix:** swap to Inngest per `docs/SCALING.md`. Schema and trigger
  signature are already in place.

For the demo URL, option 1 is enough — submit a project, see the director
plan complete, see "rendering" status. Renders themselves require a worker.

## 6. Deploy and smoke-test

After first deploy:

1. Open the production URL
2. Verify landing page loads with demo MP4
3. Sign in via magic link
4. Create a brand template
5. Submit a project — verify the director runs (status moves to "rendering")
6. Confirm OG image renders at `<production-url>/opengraph-image`

## 7. Tag the release

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 8. Optional polish

- Custom domain in Vercel → Settings → Domains
- Vercel Analytics (free tier) for traffic visibility
- Sentry integration once first real users arrive (env var already in
  `.env.example` for `SENTRY_DSN`)
