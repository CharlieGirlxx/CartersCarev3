# Carter's Care v3

A full-stack NDIS and aged care compliance management platform for Australian care providers. Covers rostering, case notes, incidents, timesheets, medications, service agreements, goals, and compliance tracking aligned to both NDIS Practice Standards and Aged Care Quality Standards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/carterscare run dev` — run the frontend (port 25269)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Demo Credentials

- Email: `parker@cdxi.au`
- Password: `220191`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS, Plus Jakarta Sans
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth (all API contracts)
- `lib/db/src/schema/` — Drizzle table definitions (one file per entity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/carterscare/src/` — React frontend (pages, components, contexts)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Modules

- **Dashboard** — KPIs, compliance score, activity feed, shift summaries
- **Participants** — NDIS/aged care clients with funding type, risk level, support plan
- **Staff** — Workers with NDIS screening, WWCC, first aid/CPR tracking
- **Roster** — Shifts with service types, NDIS line items, clock-in/out
- **Timesheets** — Weekly timesheets with approval workflow (SCHADS-aware)
- **Case Notes** — Categorised progress notes with follow-up flags
- **Incidents** — Mandatory reporting for NDIS Commission and Aged Care Quality & Safety Commission
- **Medications** — Prescription tracking with witness requirements and administration records
- **Service Agreements** — NDIS plan budgets and aged care funding contracts
- **Goals** — NDIS-aligned participant goals with progress tracking
- **Compliance** — NDIS Practice Standards + Aged Care Quality Standards dashboard

## Architecture decisions

- Contract-first OpenAPI: spec is written before any backend code; codegen produces typed hooks and Zod schemas
- Simple base64 token auth (demo mode); passwords stored as plain text for seeded demo accounts only
- Enrichment pattern: route handlers JOIN participant/staff names on reads rather than storing denormalised data
- Dashboard endpoint computes metrics on-demand from live DB queries
- All compliance logic (expiring certs, NDIS reportable flags) lives in the API layer

## User preferences

- Font: Plus Jakarta Sans
- Primary accent: Teal (#0D9488 approx) — NDIS-inspired trust colour
- No emojis in UI

## Gotchas

- Always run codegen after changing `openapi.yaml` before using new hooks
- `pnpm --filter @workspace/db run push` must be run after schema changes
- Multi-statement SQL seeds cannot use `params` — send as single string
- Activity log `type` must match the `activity_type` enum exactly
