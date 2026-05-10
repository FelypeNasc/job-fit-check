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
- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
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

### Next.js (apps/web)

- App Router with server components by default
- Client components only when interactivity is needed (`"use client"`)
- API calls go through server actions or route handlers — never call the NestJS API directly from client components
- Tailwind CSS for styling — no CSS modules, no styled-components
- Components in `src/components/` — pages in `src/app/`
- Use `React.Suspense` with loading skeletons for async data

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

## Key Data Schemas

### Job entity fields

`id` (UUID), `linkedin_id` (unique), `title`, `company`, `location`, `description` (full text), `url`, `is_easy_apply` (boolean), `posted_at`, `status` (enum: pending_analysis, analyzed, applied, rejected, saved), `created_at`

### JobAnalysis entity fields

`id` (UUID), `job_id` (FK → jobs), `fit_score` (0–100), `matching_skills` (string[]), `missing_skills` (string[]), `location_ok` (boolean), `level_match` (enum: under, match, over), `summary` (text, in Portuguese), `cover_letter` (text, in English), `deal_breakers` (string[]), `recommendation` (enum: apply, maybe, skip), `analyzed_at`

## Candidate Profile

The candidate profile used for analysis is stored in the database and editable via the dashboard's profile page. It is injected into every Ollama prompt as context. The profile contains:

- **Name:** CANDIDATE_NAME
- **Location:** CANDIDATE_LOCATION
- **Level:** Pleno / Mid-level (3–4 years of experience)
- **Core stack:** Node.js, NestJS, TypeScript, PostgreSQL, TypeORM, React, Vue.js
- **Secondary:** Python, React Native, Playwright, Jest, Git, Google Cloud (Pub/Sub, Cloud Scheduler)
- **Not experienced with:** Java, Kubernetes, AWS (minimal), GraphQL, Elasticsearch
- **Targets:** Remote roles (Brazil or global), Backend or Fullstack, Mid to Senior level
- **Languages:** Portuguese (native), English (professional proficiency)

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
```

## Commands

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d

# Pull Ollama model
docker exec -it ollama ollama pull llama3.1:8b

# Run database migrations
pnpm --filter api migration:run

# Start API (dev)
pnpm --filter api dev

# Start dashboard (dev)
pnpm --filter web dev

# Run scraper manually
pnpm --filter scraper scrape

# Run analysis on pending jobs
pnpm --filter api analyze

# Run tests
pnpm test

# Lint
pnpm lint
```

## Development Phases

1. **Scraper** — Playwright login + job extraction + persistence
2. **Analyzer** — Ollama integration + scoring + BullMQ queue
3. **Dashboard** — Next.js UI for reviewing and managing jobs
4. **Cover Letter** — Generation with dedicated prompt + editing
5. **Easy Apply** — Form fill automation with mandatory human review before submit

Always implement and test one phase fully before moving to the next.

## Important Rules

- NEVER auto-submit a job application. Always pause for human review
- NEVER commit LinkedIn credentials or cookies
- NEVER run the scraper in a tight loop — always use random delays
- NEVER use `synchronize: true` in TypeORM outside of local dev
- NEVER trust Ollama output without Zod validation
- Test scraper changes on a secondary LinkedIn account first
- Keep selectors isolated — LinkedIn UI changes frequently