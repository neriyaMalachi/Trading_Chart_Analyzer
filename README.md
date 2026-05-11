# Trading Chart Analyzer

> _We explain. You decide._

Mobile application that lets users upload a chart screenshot (stock, crypto, forex) and receive a structured AI explanation — never a buy/sell recommendation. Educational tool, not a financial advisory service.

## Monorepo layout

```
trading-chart-analyzer/
├── apps/
│   ├── mobile/    React Native + Expo (SDK 55)
│   └── api/       NestJS 11 + Drizzle + Postgres
├── packages/
│   ├── types/         Shared TS types
│   ├── validators/    Shared Zod schemas
│   └── constants/     DISCLAIMER_TEXT, LIMITS, SYSTEM_PROMPT
├── docker-compose.yml
├── nx.json
├── tsconfig.base.json
└── .eslintrc.json
```

## Hard rules

1. **`any` is forbidden.** Enforced by `@typescript-eslint/no-explicit-any: "error"`.
2. **AI never says buy or sell.** The `SYSTEM_PROMPT` and `AnalysisResponseSchema` reject any forbidden language; if it slips through, validation fails and the request is rejected.
3. **Disclaimer is non-removable** and is appended to every analysis at the API layer.

## Local setup

### Prerequisites

- Node 20.11+ (`nvm use`)
- Docker + Docker Compose
- An Anthropic API key
- An AWS account with an S3 bucket (or use the bundled MinIO)

### 1. Install

```bash
npm install
```

### 2. Start infra

```bash
docker compose up -d
```

This starts Postgres 16 (port 5432) and MinIO (port 9000, console 9001).

### 3. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
# Fill in JWT secrets, AWS creds (or MinIO), ANTHROPIC_API_KEY
```

### 4. Migrate the database

```bash
cd apps/api
npm run db:generate
npm run db:migrate
```

### 5. Run the API

```bash
npm run api          # from repo root
```

API listens on `http://localhost:3000/api`. Health check: `GET /api/health`.

### 6. Run the mobile app

```bash
npm run mobile
```

Scan the Expo QR with Expo Go, or press `i` / `a` for simulator.

## API surface (MVP)

| Method | Path                  | Auth | Purpose                                |
| ------ | --------------------- | ---- | -------------------------------------- |
| POST   | `/auth/register`      | —    | Email + password + disclaimer accepted |
| POST   | `/auth/login`         | —    | Returns `{ user, tokens }`             |
| POST   | `/auth/refresh`       | —    | Refresh token rotation                 |
| GET    | `/users/me`           | JWT  | Current user                           |
| POST   | `/analysis/upload`    | JWT  | `{ imageBase64, mimeType }` → Analysis |
| GET    | `/analysis/history`   | JWT  | Last 50 analyses                       |
| GET    | `/analysis/:id`       | JWT  | Single analysis                        |
| POST   | `/payments/checkout`  | JWT  | Stripe checkout session                |
| POST   | `/payments/webhook`   | —    | Stripe webhook                         |

## Tier limits

| Tier | Price/mo | Daily analyses          | Other        |
| ---- | -------- | ----------------------- | ------------ |
| Free | $0       | 3                       | History only |
| Pro  | $19      | Unlimited               | PDF export   |
| Team | $49      | Unlimited (5 users max) | Shared       |

## Scripts

| Command                | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run lint`         | ESLint across the workspace               |
| `npm run typecheck`    | `tsc --noEmit` across the workspace       |
| `npm run test`         | Jest across all projects                  |
| `npm run format`       | Prettier write                            |
| `npm run api`          | Start the NestJS API in dev mode          |
| `npm run mobile`       | Start the Expo dev server                 |

## Project memory

This codebase deliberately positions itself as **educational only**. Any change that softens that positioning — in copy, in AI prompt, in schema, in app store metadata — must be reviewed against the regulatory risk section of the PRD.
