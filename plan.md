# LinkedIn Job Analyzer — Plano de Desenvolvimento

## Visão Geral

Ferramenta semi-automatizada que coleta vagas filtradas do LinkedIn, analisa o fit com seu perfil usando um LLM local (Ollama), rankeia as oportunidades e facilita a aplicação com cover letters geradas automaticamente.

---

## Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Playwright  │────▶│   Extractor   │────▶│    Ollama     │────▶│  Dashboard   │
│   Scraper     │     │   Parser      │     │   Analyzer    │     │  (Next.js)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
      │                                         │                      │
      │                                         ▼                      ▼
      │                                  ┌──────────────┐     ┌──────────────┐
      │                                  │  Score + Fit  │     │  Easy Apply  │
      │                                  │   Analysis    │     │  Automator   │
      └──────────────────────────────────┴──────────────┘     └──────────────┘
```

### Stack

| Camada         | Tecnologia                              |
| -------------- | --------------------------------------- |
| Scraper        | Playwright + TypeScript                 |
| Backend/API    | NestJS + TypeScript                     |
| Banco de dados | PostgreSQL + TypeORM                    |
| LLM local      | Ollama (llama3.1, mistral ou codestral) |
| Frontend       | Next.js + React + Tailwind              |
| Fila de jobs   | BullMQ + Redis                          |

---

## Módulos e Fases

### Fase 1 — Scraper (Semana 1–2)

**Objetivo:** Coletar vagas do LinkedIn a partir de filtros predefinidos.

**Funcionalidades:**
- Login no LinkedIn via Playwright com sessão persistente (cookies salvos)
- Navegar na página de Jobs com filtros já aplicados (URL com query params)
- Extrair de cada vaga: título, empresa, localização, descrição completa, URL, tipo (Easy Apply ou externo), data de publicação
- Salvar no PostgreSQL com status `pending_analysis`

**Detalhes técnicos:**
- Usar `page.waitForSelector()` e delays aleatórios (3–8s) entre ações para simular comportamento humano
- Limitar a ~50 vagas por sessão para evitar rate limiting
- Rodar em horários variados (não em loop contínuo)
- Persistir cookies do LinkedIn entre sessões para evitar re-login
- Tratar paginação (scroll infinito na lista de vagas)

**Schema inicial:**

```sql
CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_id   VARCHAR(50) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  company       VARCHAR(255) NOT NULL,
  location      VARCHAR(255),
  description   TEXT NOT NULL,
  url           VARCHAR(500) NOT NULL,
  is_easy_apply BOOLEAN DEFAULT false,
  posted_at     TIMESTAMP,
  status        VARCHAR(20) DEFAULT 'pending_analysis',
  -- status: pending_analysis | analyzed | applied | rejected | saved
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID REFERENCES jobs(id),
  fit_score       INTEGER CHECK (fit_score BETWEEN 0 AND 100),
  matching_skills TEXT[],
  missing_skills  TEXT[],
  location_ok     BOOLEAN,
  level_match     VARCHAR(20), -- under | match | over
  summary         TEXT,
  cover_letter    TEXT,
  analyzed_at     TIMESTAMP DEFAULT NOW()
);
```

---

### Fase 2 — Analyzer com Ollama (Semana 2–3)

**Objetivo:** Analisar cada vaga contra seu perfil e gerar score de compatibilidade.

**Funcionalidades:**
- Carregar o perfil (currículo em texto) como contexto fixo
- Enviar descrição de cada vaga para o Ollama
- Receber análise estruturada em JSON
- Salvar resultado na tabela `job_analyses`

**Prompt template para o Ollama:**

```
You are a job fit analyzer. Given a candidate profile and a job description,
analyze the compatibility and respond ONLY with valid JSON.

## Candidate Profile
{profile_text}

## Job Description
{job_description}

## Respond with this exact JSON structure:
{
  "fit_score": <0-100>,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "location_compatible": <true/false>,
  "level_match": "<under|match|over>",
  "summary": "<2-3 sentence analysis in Portuguese>",
  "deal_breakers": ["<any hard blockers>"],
  "recommendation": "<apply|maybe|skip>"
}
```

**Detalhes técnicos:**
- Ollama API em `http://localhost:11434/api/generate`
- Modelo recomendado: `llama3.1:8b` (bom equilíbrio velocidade/qualidade) ou `mistral` para respostas mais rápidas
- Processar vagas em fila (BullMQ) para não sobrecarregar a máquina
- Timeout de 60s por análise
- Retry com backoff em caso de resposta malformada (até 3 tentativas)
- Validar JSON de resposta com Zod antes de salvar

---

### Fase 3 — Dashboard (Semana 3–4)

**Objetivo:** Interface para visualizar vagas rankeadas, revisar análises e decidir ação.

**Páginas:**

1. **Lista de Vagas** — Tabela com vagas ordenadas por `fit_score` DESC
   - Colunas: título, empresa, score, level_match, location_ok, status, ações
   - Filtros: score mínimo, status, localização compatível, recommendation
   - Código de cores: verde (70+), amarelo (40–69), vermelho (0–39)

2. **Detalhe da Vaga** — Ao clicar numa vaga:
   - Descrição completa da vaga
   - Análise do Ollama: skills que batem, gaps, deal breakers
   - Cover letter gerada (editável)
   - Botões: "Aplicar", "Salvar", "Rejeitar"
   - Link direto para a vaga no LinkedIn

3. **Perfil** — Página para editar/atualizar o texto do seu currículo que é usado como contexto do prompt

**API Routes (NestJS):**

```
GET    /api/jobs                  — listar vagas (com filtros e paginação)
GET    /api/jobs/:id              — detalhe + análise
PATCH  /api/jobs/:id/status       — atualizar status (applied, rejected, saved)
POST   /api/jobs/scrape           — trigger manual do scraper
POST   /api/jobs/:id/analyze      — re-analisar uma vaga específica
POST   /api/jobs/:id/cover-letter — gerar/regenerar cover letter
GET    /api/profile               — retornar perfil atual
PUT    /api/profile               — atualizar perfil
GET    /api/stats                 — métricas (total, por status, score médio)
```

---

### Fase 4 — Cover Letter Generator (Semana 4)

**Objetivo:** Gerar cover letters personalizadas para vagas com score alto.

**Funcionalidades:**
- Prompt dedicado que recebe perfil + vaga + análise de fit
- Gera cover letter no tamanho especificado (400 chars para LinkedIn, full para email)
- Editável no dashboard antes de usar
- Salva versões (para não perder edições)

**Prompt template:**

```
You are a professional cover letter writer.
Write a cover letter for the following job based on the candidate's profile.

## Candidate Profile
{profile_text}

## Job Description
{job_description}

## Fit Analysis
{fit_analysis_json}

## Instructions
- Length: {max_chars} characters
- Language: English
- Tone: professional but genuine
- Focus on matching skills and concrete achievements
- Do not mention missing skills
- Do not be generic — reference specific aspects of the role

Respond with ONLY the cover letter text, no additional formatting.
```

---

### Fase 5 — Easy Apply Automator (Semana 5)

**Objetivo:** Preencher automaticamente o formulário Easy Apply do LinkedIn.

**Funcionalidades:**
- Abrir a vaga no LinkedIn via Playwright
- Clicar em "Easy Apply"
- Preencher campos do formulário (nome, email, telefone, experiência)
- Colar cover letter no campo de texto (se houver)
- **Parar antes de submeter** — aguardar confirmação manual
- Tirar screenshot da tela final para registro

**Importante:**
- Este módulo é o mais arriscado para detecção. Usar com moderação (máx 5–10 aplicações por dia)
- Sempre pausar para revisão humana antes do submit
- Logar cada ação para auditoria

---

## Estrutura do Projeto

```
linkedin-job-analyzer/
├── apps/
│   ├── scraper/                 # Playwright scripts
│   │   ├── src/
│   │   │   ├── linkedin.ts      # Login, navegação, extração
│   │   │   ├── parser.ts        # Parsing do HTML das vagas
│   │   │   └── scheduler.ts     # Agendamento de scraping
│   │   └── package.json
│   │
│   ├── api/                     # NestJS backend
│   │   ├── src/
│   │   │   ├── jobs/            # CRUD de vagas
│   │   │   ├── analysis/        # Integração com Ollama
│   │   │   ├── profile/         # Gerenciamento de perfil
│   │   │   ├── cover-letter/    # Geração de cover letters
│   │   │   └── queue/           # BullMQ workers
│   │   └── package.json
│   │
│   └── web/                     # Next.js dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx           # Lista de vagas
│       │   │   ├── jobs/[id]/page.tsx # Detalhe da vaga
│       │   │   ├── profile/page.tsx   # Edição de perfil
│       │   │   └── stats/page.tsx     # Métricas
│       │   └── components/
│       └── package.json
│
├── packages/
│   └── shared/                  # Types, utils compartilhados
│       ├── types/
│       └── prompts/             # Templates de prompts
│
├── docker-compose.yml           # PostgreSQL + Redis + Ollama
├── turbo.json                   # Monorepo config
└── package.json
```

---

## Docker Compose (dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: job_analyzer
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  pgdata:
  ollama_models:
```

---

## Riscos e Mitigações

| Risco | Mitigação |
| --- | --- |
| Ban de conta no LinkedIn | Delays aleatórios, limitar sessões, rotacionar horários, usar conta secundária para testes |
| Ollama lento em CPU | Usar modelo menor (mistral 7B) ou quantizado (Q4). GPU recomendada |
| JSON malformado do Ollama | Validação com Zod + retry (até 3x) + fallback para análise parcial |
| Vaga já expirada no momento da aplicação | Checar status antes de tentar Easy Apply |
| LinkedIn muda a UI | Selectors vão quebrar — isolar parsing em módulo dedicado para facilitar manutenção |
| Aplicação acidental em vaga ruim | Obrigar revisão humana antes de qualquer submit |

---

## Cronograma Resumido

| Semana | Fase | Entregável |
| --- | --- | --- |
| 1–2 | Scraper | Coleta e persistência de vagas funcionando |
| 2–3 | Analyzer | Integração Ollama + scoring automático |
| 3–4 | Dashboard | Interface para review e gestão de vagas |
| 4 | Cover Letter | Geração automática editável |
| 5 | Easy Apply | Preenchimento automático com pausa para revisão |

---

## Próximos Passos

1. Criar o monorepo com Turborepo e configurar o `docker-compose.yml`
2. Implementar o scraper básico: login + extração de 10 vagas de teste
3. Testar prompt do Ollama isoladamente com 5 descrições de vagas reais
4. Iterar no prompt até o JSON sair consistente
5. Conectar scraper → banco → analyzer → dashboard