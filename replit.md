# Elearn Academy

A Tanzania-focused learning platform for practical workshops and AI courses.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/elearn/src/App.tsx` — first public experience, mock course data, and client-side routes
- `artifacts/elearn/src/index.css` — Elearn visual language and responsive styling
- `lib/api-spec/openapi.yaml` — shared API contract, when backend-backed flows are added

## Architecture decisions

- The first milestone is frontend-first and uses mock course data so the public learning journey can be shaped before backend persistence is introduced.
- The public surface is route-driven with Wouter so landing, catalog, course detail, login, and registration are directly navigable.

## Product

- Public landing page introducing Elearn's practical learning promise
- Searchable and filterable workshop/AI course catalog
- Course detail pages with outline, instructor details, pricing, and enrollment feedback
- Responsive login and registration entry points

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
