---
name: code-style
description: Activates when writing any TypeScript file. Encodes project's strict TypeScript, pnpm, Vitest, and Next.js App Router conventions.
tier: 1
---

# Code Style — ReelMind Stack

## Tier 1 — Always Loaded

**Activates when:** Writing or modifying any `.ts` or `.tsx` file

**Domain:** TypeScript + Next.js + Testing conventions

## Tier 2 — Core Conventions

### TypeScript (strict mode always)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

- No `any` type — use `unknown` + type narrowing instead
- No `@ts-ignore` without a preceding comment explaining why
- No `@ts-expect-error` without justification

### Imports

- Absolute paths via `@/` alias (configured in tsconfig)
- Example: `import { parseScript } from "@/agent/nodes"` not `import { parseScript } from "../../../agent/nodes"`

### React & Next.js

- Server Components (RSC) by default
- `"use client"` only when component has event handlers, `useState`, or browser APIs
- Server Actions for all mutations
- Never use `useEffect` for data fetching — use RSC or TanStack Query

### Forms

- All forms use React Hook Form + `@hookform/resolvers/zod` + explicit Zod schema
- Validation: Zod on client and server
- Error handling: field-level errors displayed immediately

### Testing

- Vitest + `vi.mock()` before imports that are mocked
- Never use `@testing-library/react` for RSC tests
- Mock all external APIs (Supabase, Anthropic, etc.)

### Package Manager

- pnpm only — never `npm install` or `yarn`
- Lock file: `pnpm-lock.yaml` committed
- Command: `pnpm install`, `pnpm add`, `pnpm remove`

### Zod Validation

- All external data (user input, API responses) validated with Zod
- Server and client both validate
- Never trust data from the browser or external APIs

### Error Handling

- Never swallow errors silently
- Log errors with context
- User-facing errors: clear messages
- Internal errors: stack traces and context

## Tier 3 — Reference Files

Refer to `tsconfig.json`, `next.config.js`, `vitest.config.ts`, `.eslintrc.js` for exact configuration. Run `pnpm typecheck` before every commit.
