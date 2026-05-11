# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tagline

> _We explain. You decide._ — The product is **educational only**. It does not give financial advice.

## Hard rules (non-negotiable)

1. **`any` is forbidden** — `@typescript-eslint/no-explicit-any` is set to `error` (also in tests).
2. **The AI must never recommend buy/sell.** Forbidden language is enforced in two places that must stay aligned:
   - `packages/constants/src/prompt.ts` — `SYSTEM_PROMPT` instructs the model.
   - `packages/validators/src/analysis.schema.ts` — `FORBIDDEN_PATTERNS` regexes in `AnalysisResponseSchema` reject violating output. If validation fails, the request is rejected with `BadGatewayException`.
3. **Disclaimer is non-removable.** `ClaudeService.analyseChart` overwrites whatever `disclaimer` field the model returned with the canonical `DISCLAIMER_TEXT` from `@tca/constants` before persisting.
4. **Educational positioning is load-bearing.** Any change to copy, prompt, schema, or app-store metadata that softens this must be reviewed against the regulatory-risk section of the PRD (`Trading_Chart_Analyzer_PRD.pdf`).

## Workspace layout

Nx-managed npm workspaces monorepo:

- `apps/api` — NestJS 11, Drizzle ORM, Postgres 16, Anthropic SDK, Stripe.
- `apps/mobile` — React Native 0.85 + Expo SDK 55, NativeWind, React Query, Zustand, React Navigation.
- `packages/types` — shared TS types (no runtime).
- `packages/validators` — shared Zod schemas (the source of truth for request/response shape).
- `packages/constants` — `DISCLAIMER_TEXT`, `LIMITS`, `PRICING`, `SYSTEM_PROMPT`, `USER_PROMPT_TEMPLATE`, MIME types.

Workspace TS path aliases (`tsconfig.base.json`): `@tca/types`, `@tca/validators`, `@tca/constants`. Always import from these aliases — never reach across `packages/*` with relative paths.

## Commands

Run from the repo root unless noted:

| Command | What it does |
| --- | --- |
| `npm install` | Install workspace dependencies |
| `npm run lint` | `nx run-many --target=lint --all` |
| `npm run typecheck` | `tsc --noEmit` across the workspace |
| `npm run test` | Jest across all projects |
| `npm run format` | Prettier write |
| `npm run api` | `nx run api:start:dev` (NestJS watch mode, listens on `http://localhost:3000/api`) |
| `npm run mobile` | `nx run mobile:start` (Expo dev server) |
| `docker compose up -d` | Start Postgres (5432) and MinIO (9000, console 9001) |

API-specific (run from `apps/api/`):

| Command | What it does |
| --- | --- |
| `npm run db:generate` | Drizzle migration generator |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run test:e2e` | NestJS e2e tests (`test/jest-e2e.json`) |
| `npm run test -- <pattern>` | Run a single Jest test by name/path |

CI (`.github/workflows/ci.yml`) runs `npm ci → lint → typecheck → test` on push/PR to `main`. Reproduce locally before pushing.

## Architecture

### Validator-first contract flow

The Zod schemas in `@tca/validators` are the contract that ties API and mobile together. The flow:

```
@tca/validators (Zod schema)
  ├── apps/api uses it via nestjs-zod for request validation AND to validate Claude's JSON output
  └── apps/mobile uses inferred types when calling the API
```

When changing an API request/response shape, update the Zod schema in `packages/validators` first; both sides pick up the new types from `z.infer`.

### API request pipeline (analysis upload)

`apps/api/src/modules/analysis/analysis.service.ts:upload` is the canonical example:

1. `UsersService.assertCanAnalyse` — resets the daily counter at UTC midnight and enforces `LIMITS.FREE_DAILY_ANALYSES` (3/day) for the `free` tier; pro/team are unlimited.
2. `S3Service.uploadChartImage` — uploads the decoded image to S3 (or MinIO in dev) under `charts/{userId}/{ts}-{hex}.{ext}`, with `ServerSideEncryption: AES256`.
3. `ClaudeService.analyseChart` — sends the base64 image + `SYSTEM_PROMPT` + `USER_PROMPT_TEMPLATE` to Anthropic, extracts the JSON object, validates with `AnalysisResponseSchema`, and **forces** `disclaimer: DISCLAIMER_TEXT`.
4. Persist the row, increment the user's daily counter, and **prune anything beyond `LIMITS.MAX_HISTORY_PER_USER` (50)** for that user.
5. Return an `Analysis` whose `imageUrl` is a signed S3 URL (`S3_SIGNED_URL_TTL_SECONDS`, default 1h).

Do not skip the prune step or the disclaimer overwrite — they are part of the product guarantee, not optional cleanup.

### Auth

`AuthService` (`apps/api/src/modules/auth/auth.service.ts`):
- bcrypt password hashing (`BCRYPT_ROUNDS = 12`).
- JWT access token (15 min) signed with `JWT_ACCESS_SECRET`; payload `{ sub, email, tier }`.
- Refresh token: 48 random bytes, **HMAC-SHA256-hashed with `JWT_REFRESH_SECRET`** before storage in `refresh_tokens`. Refresh rotates (revokes old, issues new). 30-day TTL.
- Routes: `JwtAuthGuard` + `@CurrentUser()` decorator (see `apps/api/src/modules/auth/`).

### Database

Drizzle schema in `apps/api/src/db/schema.ts`. Tables: `users` (with `tier` enum `free|pro|team`, `dailyAnalysisCount`, `dailyAnalysisResetAt`), `refresh_tokens` (rotation, `revokedAt`), `analyses` (with `trend` enum `bullish|bearish|sideways` and `jsonb` for `keyLevels`/`technicalSignals`/`pointsToWatch`, all typed via `$type<...>()`). `DB_TOKEN` is a `Symbol` provided by `DbModule` (global) — inject with `@Inject(DB_TOKEN) private readonly db: Database`.

### Throttling & config

Global `ThrottlerGuard` configured from `LIMITS.THROTTLE_TTL_SECONDS` / `LIMITS.THROTTLE_LIMIT_PER_MIN` (60s / 30 req). All env vars are validated by `configValidationSchema` (Zod) at boot in `apps/api/src/config/env.schema.ts` — add new env vars there.

### Mobile

`apps/mobile/App.tsx` wires `SafeAreaProvider → QueryClientProvider → NavigationContainer → RootNavigator`. State: Zustand stores in `src/stores/` (`auth.store.ts`, `analysis.store.ts`). API calls go through `src/api/client.ts:apiRequest`, which:
- Reads tokens from `useAuthStore`.
- Auto-refreshes on `401` via `/auth/refresh`, retries once, and clears auth on failure.
- Throws a typed `ApiError(status, message, payload)`.
Styling is NativeWind (Tailwind for RN). Deep-link scheme for Stripe redirects: `tca://billing/success` / `tca://billing/cancel`.

### Stripe

`PaymentsService` is constructed even when Stripe env vars are absent — it no-ops gracefully (`this.stripe` is null). Webhook flow updates `users.tier` on `checkout.session.completed` and downgrades to `free` on `customer.subscription.deleted`. Tier inference from `amount_total >= 4900` → `team` else `pro` is brittle; if you add price tiers, switch to looking up by price ID instead.

## Conventions

- **Imports**: `import-x/order` enforced — groups (`builtin`, `external`, `internal`, `parent`, `sibling`, `index`) separated by blank lines, alphabetized case-insensitively. Use `import type` for types (`@typescript-eslint/consistent-type-imports`).
- **No non-null assertions** (`!`) — `@typescript-eslint/no-non-null-assertion: error`. Handle the nullable case explicitly.
- **`noUncheckedIndexedAccess: true`** in `tsconfig.base.json` — array/object index access yields `T | undefined`. Plan for it.
- **`console.log` is a warning**; `console.warn` / `console.error` are fine. Prefer NestJS `Logger` in API code.
- **Return-type annotations** are warned-on (`explicit-function-return-type`) — add them to non-trivial functions; arrow expressions are exempt.
- **Husky + lint-staged** runs `eslint --fix` + `prettier --write` on staged `.ts`/`.tsx`. Do not bypass with `--no-verify`.

## Local setup quick path

```bash
nvm use                    # Node 20.11+
npm install
docker compose up -d
cp apps/api/.env.example apps/api/.env   # fill JWT secrets, AWS/MinIO creds, ANTHROPIC_API_KEY
cd apps/api && npm run db:generate && npm run db:migrate && cd ../..
npm run api    # in one terminal
npm run mobile # in another
```

Health check: `GET http://localhost:3000/api/health`.
