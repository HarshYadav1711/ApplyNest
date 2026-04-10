# ApplyNest

**ApplyNest** is a full-stack job-application tracker: sign in, record roles you have applied for, and move them through a **five-stage pipeline** (Applied → Phone Screen → Interview → Offer → Rejected) on a Kanban board. You can paste a job description to **parse structured fields** (company, role, skills, seniority, location) and generate **tailored resume bullet ideas**—with sensible behavior when AI is not configured.

This repository is a **npm workspaces monorepo** (`apps/web`, `apps/api`) intended to be easy to run locally and straightforward to deploy as two artifacts (static SPA + Node API).

---

## What’s in the box

| Area | Behavior |
|------|------------|
| **Auth** | Email + password; JWT access tokens; bcrypt password hashing. |
| **Applications** | Per-user CRUD with company, role, links, notes, dates, status, optional salary, location, seniority, and skill lists. |
| **Pipeline** | Drag-and-drop Kanban with optimistic status updates. |
| **AI (optional)** | Parse pasted JDs and suggest resume bullets; **deterministic fallbacks** when `OPENAI_API_KEY` is not set. |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| **Web** | React 19, TypeScript, Vite, Tailwind CSS, React Query, React Router, dnd-kit |
| **API** | Express, TypeScript, Mongoose, Zod, JWT, bcrypt, optional OpenAI SDK |
| **Data** | MongoDB |

---

## Repository layout

```
apps/web/     SPA — pages, Kanban UI, modals, shared UI primitives
apps/api/     REST API — routes → controllers → services (business + AI logic here)
```

**Design choices (short):**

- **Thin route handlers** — HTTP concerns stay in controllers; **AI and domain logic live in `services/`** so behavior stays testable and swappable.
- **Zod at the boundary** — request bodies and AI JSON outputs are validated before use.
- **JWT in `localStorage`** — simple for a demo/product MVP; acceptable tradeoff documented below under *Out of scope*.
- **Monorepo** — one install, shared conventions, independent deployables.

---

## Prerequisites

- **Node.js 20+**
- **MongoDB** reachable from the API (local instance, Docker, or hosted URI)

---

## Setup (local)

**1. Install dependencies**

```bash
git clone <repository-url>
cd ApplyNest
npm install
```

**2. Configure the API**

```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env`: set **`MONGODB_URI`** and **`JWT_SECRET`** to real values for your machine. See [Environment variables](#environment-variables) for the full list.

**3. Run the stack**

Use **two terminals**:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

- **Web:** [http://localhost:5173](http://localhost:5173) — Vite dev server proxies `/api` to the API.
- **API:** [http://localhost:4000](http://localhost:4000) — health check: `GET /api/health`

Register an account in the UI, then use the pipeline.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:web` | Vite dev server (`apps/web`) |
| `npm run dev:api` | API with watch (`apps/api`) |
| `npm run build` | Production build: web → API compile |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run lint` | ESLint (web) |

---

## Environment variables

All variables are documented in **[`.env.example`](.env.example)**. Summary:

### API (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret used to sign JWTs (use a long random value in production) |
| `PORT` | No | Listen port (default `4000`) |
| `NODE_ENV` | No | `development` / `production` |
| `CORS_ORIGIN` | No | Allowed browser origin (default `http://localhost:5173`) |
| `JWT_EXPIRES_SECONDS` | No | Access token TTL in seconds (default `604800`) |
| `OPENAI_API_KEY` | No | Enables OpenAI-backed JD parsing and resume bullets; omitted → local fallbacks |
| `OPENAI_MODEL` | No | Model when API key is set (default `gpt-4o-mini`) |

### Web (`apps/web/.env` — production only)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Public API base URL when the SPA and API are on **different origins**. Leave unset in dev (proxy handles `/api`). |

---

## Production build (overview)

1. Set `VITE_API_URL` for the web build if the API is not same-origin.
2. Run `npm run build` — outputs `apps/web/dist` and `apps/api/dist`.
3. Serve the SPA as static files and run `node apps/api/dist/server.js` (or your process manager) with production `apps/api/.env`.

CORS must allow your deployed web origin (`CORS_ORIGIN`).

---

## API overview

| Area | Notes |
|------|--------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer) |
| Applications | `GET/POST /api/applications`, `GET/PATCH/DELETE /api/applications/:id` (Bearer) |
| AI | `POST /api/ai/parse-job`, `POST /api/ai/resume-bullets` (Bearer) — structured JSON, validated server-side |

Details and shapes are defined in route validators and `apps/api/src/services/ai/schemas.ts`.

---

## Security & secrets

- **No application secrets belong in git.** This repo should only contain **`.env.example`** (placeholders), not real `.env` files.
- **`.gitignore`** excludes `.env` and common local variants.
- Before sharing or open-sourcing, run your own scan (e.g. search for API keys, connection strings, and private URLs). The template uses obvious placeholders such as `replace-with-a-long-random-string-at-least-32-characters` for `JWT_SECRET`.

---

## Intentionally out of scope (for now)

These are deliberate boundaries for a focused MVP—not omissions by accident:

- **Social / SSO login** (Google, GitHub, etc.)
- **Email verification**, password reset, or magic links
- **Refresh tokens** / token rotation (short-lived access JWTs only)
- **Rate limiting**, CAPTCHA, and abuse monitoring on auth and AI routes
- **Automated test suite** (unit/e2e) — recommended next step before large refactors
- **Multi-tenant admin**, analytics, or billing
- **Mobile apps** / offline support
- **Hosted AI** beyond optional OpenAI — fallbacks exist specifically to keep local dev simple

---

## License

Private — all rights reserved unless otherwise stated by the repository owner.
