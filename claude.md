# CLAUDE.md — LinkedIn Job Analyzer

## Project Overview

Semi-automated tool that scrapes filtered LinkedIn job listings, analyzes fit against a candidate profile using a local LLM (Ollama), ranks opportunities in a dashboard, and facilitates applications with auto-generated cover letters.

## Architecture

Turborepo monorepo with three apps and one shared package:

```
linkedin-job-analyzer/
├── apps/
│   ├── scraper/        # Playwright scripts (standalone TypeScript)
│   ├── api/            # NestJS backend
│   └── web/            # Next.js 14 dashboard (App Router)
├── packages/
│   └── shared/         # Types, utils, prompt templates
├── docker-compose.yml  # PostgreSQL 16 + Redis 7 + Ollama
└── turbo.json
```

## Tech Stack

- **Language:** TypeScript (strict mode) across all apps
- **Scraper:** Playwright
- **Backend:** NestJS + TypeORM + BullMQ
- **Real-Time:** Socket.io 4.8 (`@nestjs/websockets` + `@nestjs/platform-socket.io` on API, `socket.io-client` on web)
- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives + class-variance-authority + tailwind-merge + lucide-react)
- **Data Tables:** @tanstack/react-table
- **File Processing:** multer + mammoth (DOCX) + pdf-parse (PDF)
- **Database:** PostgreSQL 16
- **Queue:** BullMQ + Redis
- **LLM:** Ollama (llama3.1:8b or mistral:7b) running locally on port 11434
- **Monorepo:** Turborepo

## Code Conventions

### General

- Use English for all code, comments, variable names, and commit messages
- User-facing text in the dashboard is in Portuguese (pt-BR)
- Always use `const` over `let` when the variable is not reassigned
- Prefer early returns over nested conditionals
- Max file length: ~300 lines. Split if exceeding
- Use barrel exports (`index.ts`) in each module folder

### TypeScript

- Strict mode enabled (`"strict": true`)
- No `any` — use `unknown` and narrow with type guards
- Use interfaces for object shapes, types for unions/intersections
- Zod for runtime validation of external data (Ollama responses, scraped data)
- Enums only for fixed sets (job status, level match). Otherwise use union types

### NestJS (apps/api)

- Follow NestJS module structure: `module.ts`, `controller.ts`, `service.ts`, `*.entity.ts`, `*.dto.ts`
- DTOs validated with `class-validator` and `class-transformer`
- Use repository pattern via TypeORM repositories
- All endpoints return consistent shape: `{ data, meta? }` on success
- Errors use NestJS built-in exception filters (HttpException, etc.)
- Environment variables via `@nestjs/config` with validation schema

### WebSocket / Real-Time (Socket.io)

- Namespace: `/analysis` — configured in `apps/api/src/analysis/analysis.gateway.ts`
- Adapter: `IoAdapter` set via `app.useWebSocketAdapter(new IoAdapter(app.getHttpServer()))` in `main.ts`
- CORS origin: `http://localhost:3000`

Events emitted by the server:

| Event | Payload |
|---|---|
| `analysis:queued` | `{ count: number }` |
| `analysis:started` | `{ jobId, title, company }` |
| `analysis:completed` | `{ jobId, title, fitScore, recommendation }` |
| `analysis:failed` | `{ jobId }` |

Frontend hook: `apps/web/src/hooks/use-analysis-socket.ts`
- Connects to `NEXT_PUBLIC_API_URL` (strips `/api` suffix) + namespace `/analysis`
- Transport: websocket only (no polling fallback)
- Returns `AnalysisProgressState` + optional callbacks `onJobDone`, `onAllDone`
- Auto-disconnects on component unmount

Progress bar: `apps/web/src/components/analysis-progress-bar.tsx` — fixed bottom, debounced router refresh on completion (800ms)

### Next.js (apps/web)

- App Router with server components by default
- Client components only when interactivity is needed (`"use client"`)
- Data mutations use **server actions** in `app/**/actions.ts` files — never call the NestJS API directly from client components
- Tailwind CSS for styling — no CSS modules, no styled-components
- Components in `src/components/` — shadcn/ui primitives in `src/components/ui/`; pages in `src/app/`
- Use `React.Suspense` with loading skeletons for async data
- shadcn/ui components in use: Button, Badge, Card, Checkbox, Input, Select, Separator, Table, Textarea
- `NEXT_PUBLIC_API_URL` env var used in client-side socket hook (default: `http://localhost:3001/api`)

### Playwright (apps/scraper)

- All selectors in a dedicated `selectors.ts` file for easy maintenance when LinkedIn changes UI
- Random delays between actions: `await delay(randomBetween(3000, 8000))`
- Max 50 jobs per scraping session
- Persist cookies in `cookies.json` (gitignored)
- Never commit credentials or session tokens
- Log every navigation and click action for debugging

### Database

- Two main tables: `jobs` and `job_analyses`
- UUIDs as primary keys
- Status flow for jobs: `pending_analysis` → `analyzed` → `applied` | `rejected` | `saved`
- All timestamps in UTC
- Migrations via TypeORM migration files, never `synchronize: true` in production

### Ollama Integration

- API endpoint: `http://localhost:11434/api/generate`
- All prompts stored in `packages/shared/prompts/` as template functions
- Ollama responses MUST be validated with Zod before saving
- Retry up to 3 times with exponential backoff on malformed JSON
- Timeout: 60 seconds per analysis
- Process one job at a time via BullMQ to avoid overloading

## API Endpoints

### Jobs
- `GET /api/jobs` — list all jobs (query filters: status, recommendation, search)
- `GET /api/jobs/:id` — single job with analysis
- `PATCH /api/jobs/:id/status` — update job status
- `POST /api/jobs/:id/analyze` — queue single job for analysis
- `POST /api/jobs/reanalyze-all` — queue all jobs regardless of current status
- `DELETE /api/jobs` — bulk delete, body `{ ids: string[] }`

### Scraper
- `GET /api/scraper/status` — returns `{ running: boolean }`
- `POST /api/scraper/trigger` — spawns scraper process; auto-queues analysis on completion

### Profile
- `GET /api/profile` — get candidate profile
- `PUT /api/profile` — update candidate profile
- `POST /api/profile/import` — multipart/form-data (PDF or DOCX), extracts profile fields via Ollama

## Key Data Schemas

### Job entity fields

`id` (UUID), `linkedin_id` (unique), `title`, `company`, `location`, `description` (full text), `url`, `is_easy_apply` (boolean), `posted_at`, `status` (enum: pending_analysis, analyzed, applied, rejected, saved), `created_at`

### JobAnalysis entity fields

`id` (UUID), `job_id` (FK → jobs), `fit_score` (0–100), `matching_skills` (string[]), `missing_skills` (string[]), `location_ok` (boolean), `level_match` (enum: under, match, over), `summary` (text, in Portuguese), `cover_letter` (text, in English), `deal_breakers` (string[]), `recommendation` (enum: apply, maybe, skip), `analyzed_at`

## Candidate Profile

The candidate profile is stored in the database and editable via the dashboard's profile page. It is injected into every Ollama prompt as context. Fields:

- **Name**
- **Location**
- **Level** (e.g. Junior / Mid-level / Senior)
- **Core Stack** (primary technologies)
- **Secondary Skills**
- **Not Experienced With**
- **Target Roles**
- **Languages**

Populate via the profile page — either import a PDF/DOCX resume or fill manually.

## Ollama Prompt Guidelines

- System prompt sets the role as "job fit analyzer"
- Always request JSON-only output — no markdown, no preamble
- Include the full candidate profile in every request
- Include the full job description (not truncated)
- Score criteria: stack match (40%), level match (25%), location compatibility (20%), domain relevance (15%)
- Summary must be in Portuguese (pt-BR)
- Cover letter must be in English

## Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=job_analyzer
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# LinkedIn (gitignored, never commit)
LINKEDIN_EMAIL=
LINKEDIN_PASSWORD=

# App
API_PORT=3001
WEB_PORT=3000

# Web (client-side, exposed to browser)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Commands

```bash
# Install dependencies
bun install

# Start infrastructure
docker compose up -d

# Pull Ollama model
docker exec -it ollama ollama pull llama3.1:8b

# Run database migrations
bun --filter @job-analyzer/api migration:run

# Start API (dev)
bun --filter @job-analyzer/api dev

# Start dashboard (dev)
bun --filter @job-analyzer/web dev

# Run scraper manually
bun --filter @job-analyzer/scraper scrape

# Run analysis on pending jobs
bun --filter @job-analyzer/api analyze

# Run tests
bun test

# Lint
bun lint
```

## Development Phases

1. **Scraper** — complete. Playwright login + job extraction + persistence
2. **Analyzer** — complete. Ollama integration + scoring + BullMQ queue + cover letter generation
3. **Dashboard** — complete. Jobs list/detail, profile page, all CRUD, real-time progress bar, CV import, scraper trigger, multi-select delete, reanalyze-all
4. **Cover Letter** — included in Phase 2 (generated by Ollama, stored in `job_analyses.cover_letter`)
5. **Easy Apply** — not started. Form fill automation with mandatory human review before submit

Always implement and test one phase fully before moving to the next.

## Important Rules

- NEVER auto-submit a job application. Always pause for human review
- NEVER commit LinkedIn credentials or cookies
- NEVER run the scraper in a tight loop — always use random delays
- NEVER use `synchronize: true` in TypeORM outside of local dev
- NEVER trust Ollama output without Zod validation
- Test scraper changes on a secondary LinkedIn account first
- Keep selectors isolated — LinkedIn UI changes frequently