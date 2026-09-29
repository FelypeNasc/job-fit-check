# LinkedIn Job Analyzer

Semi-automated tool that scrapes filtered LinkedIn job listings, analyzes fit against a candidate profile using a local LLM (Ollama), ranks opportunities in a dashboard, and facilitates applications with auto-generated cover letters.

## Features

- **Scraper** — Playwright-based LinkedIn scraper with anti-detection delays
- **Analyzer** — Local LLM (Ollama) scores each job against your profile (0–100)
- **Dashboard** — Next.js UI to review, filter, and manage job opportunities
- **Cover Letter** — Auto-generated cover letters per job via Ollama
- **Privacy-first** — Everything runs locally; no data leaves your machine

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| Scraper | Playwright |
| Backend | NestJS + TypeORM + BullMQ |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Database | PostgreSQL 16 |
| Queue | BullMQ + Redis 7 |
| LLM | Ollama (llama3.1:8b) |
| Monorepo | Turborepo + Bun |

## Project Structure

```
linkedin-job-analyzer/
├── apps/
│   ├── scraper/        # Playwright scripts
│   ├── api/            # NestJS backend (port 3001)
│   └── web/            # Next.js dashboard (port 3000)
├── packages/
│   └── shared/         # Types, enums, Zod schemas, prompt templates
├── docker-compose.yml  # PostgreSQL + Redis + Ollama
└── turbo.json
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.3.14
- [Docker](https://www.docker.com) + Docker Compose
- [NVIDIA GPU](https://developer.nvidia.com/cuda-downloads) (optional, for faster Ollama inference)
- LinkedIn account

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/linkedin-job-analyzer.git
cd linkedin-job-analyzer
bun install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/scraper/.env.example apps/scraper/.env
```

Required variables:

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

# LinkedIn (never commit these)
LINKEDIN_EMAIL=your@email.com
LINKEDIN_PASSWORD=yourpassword

# App
API_PORT=3001
WEB_PORT=3000
```

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL 16, Redis 7, and Ollama.

### 4. Pull the LLM model

```bash
docker exec -it ollama ollama pull llama3.1:8b
```

> Alternatively use `mistral:7b`. Update `OLLAMA_MODEL` accordingly.

### 5. Run database migrations

```bash
bun --filter @job-analyzer/api migration:run
```

### 6. Start the API and dashboard

```bash
# Both in parallel
bun run dev

# Or individually
bun run api   # NestJS on :3001
bun run web   # Next.js on :3000
```

## Usage

### Scrape jobs

```bash
bun run scrape
```

Logs into LinkedIn, navigates to your saved search, and extracts up to 50 job listings. Uses random delays (3–8s) between actions to avoid detection.

> **First run:** The scraper will prompt for LinkedIn 2FA if enabled. Cookies are saved to `apps/scraper/cookies.json` (gitignored) for subsequent runs.

### Analyze jobs

```bash
bun run analyze
```

Processes all `pending_analysis` jobs through Ollama via a BullMQ queue (one at a time). Each job receives:

- Fit score (0–100)
- Matching and missing skills
- Level match (under / match / over)
- Summary in Portuguese
- Cover letter in English
- Recommendation: `apply` / `maybe` / `skip`

### Review in dashboard

Open [http://localhost:3000](http://localhost:3000) to browse analyzed jobs, read summaries, copy cover letters, and update application status.

## Scoring Criteria

| Criterion | Weight |
|---|---|
| Stack match | 40% |
| Level match | 25% |
| Location compatibility | 20% |
| Domain relevance | 15% |

## Job Status Flow

```
pending_analysis → analyzed → applied
                            → rejected
                            → saved
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/:id` | Get job + analysis |
| PATCH | `/api/jobs/:id/status` | Update job status |
| POST | `/api/jobs/:id/analyze` | Queue job for analysis |
| GET | `/api/profile` | Get candidate profile |
| PUT | `/api/profile` | Update candidate profile |

## Development

```bash
# Run all apps in dev mode
bun run dev

# Lint
bun run lint

# Tests
bun run test

# Scraper in debug mode (opens Playwright inspector)
bun --filter @job-analyzer/scraper scrape:debug

# Revert last migration
bun --filter @job-analyzer/api migration:revert
```

## Important Rules

- **NEVER auto-submit** a job application — always pause for human review
- **NEVER commit** LinkedIn credentials or `cookies.json`
- **NEVER run** the scraper in a tight loop — random delays are required
- Test scraper changes on a secondary LinkedIn account first

## Roadmap

- [x] Phase 1 — Playwright scraper
- [x] Phase 2 — Ollama analyzer + BullMQ queue
- [x] Phase 3 — Next.js dashboard
- [ ] Phase 4 — Refining
- [ ] Phase 5 — Cover letter editing UI
- [ ] Phase 6 — Easy Apply automation (with mandatory human review)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit using Conventional Commits: `feat:`, `fix:`, `chore:`, etc.
4. Open a pull request against `main`

All code, comments, and commit messages must be in **English**. Dashboard user-facing text is in **Portuguese (pt-BR)**.

## License

MIT
