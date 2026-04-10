# ApplyNest

## Overview

ApplyNest is a full-stack tool for tracking job applications: each role is a record with metadata, and you move it through a fixed five-stage pipeline on a Kanban board. Optional AI assists with parsing pasted job descriptions into structured fields and drafting resume bullet ideas; without an API key, the app still runs using deterministic parsers.

The codebase is an **npm workspaces** monorepo—**`apps/web`** (Vite + React) and **`apps/api`** (Express)—built to deploy as a static SPA plus a stateless Node API behind MongoDB.

**Live** — [https://apply-nest-web.vercel.app/login](https://apply-nest-web.vercel.app/login) · [https://applynest-k4yp.onrender.com/](https://applynest-k4yp.onrender.com/)

---

## Key features

- **Auth** — Email/password, bcrypt hashes, JWT access tokens, protected routes.
- **Applications** — CRUD per user: company, role, JD link, notes, applied date, status, optional salary; location, seniority, required/nice-to-have skills.
- **Pipeline** — Five columns (Applied → Rejected), drag-and-drop via dnd-kit, optimistic status updates.
- **Search & filter** — Client-side search (company, role, location) and filter by stage.
- **JD parsing** — Paste a posting; API returns structured JSON (validated with Zod). OpenAI when configured; **fallback parser** when not.
- **Resume bullets** — Optional AI-generated suggestions (3–5 lines) tied to the JD and skills; **fallback** without `OPENAI_API_KEY`.
- **Demo samples** — On the empty pipeline, three one-click sample JDs (clean, messy, edge-case) to exercise parsing without hunting real postings.

---

## Screenshots

Add assets under `docs/screenshots/` (or your preferred path) and link them here.

| Placeholder | Suggested capture |
|-------------|-------------------|
| `pipeline.png` | Home: Kanban with cards across stages |
| `modal-parse.png` | New application modal: JD paste + Parse |
| `demo-samples.png` | Empty state: “Try with sample job descriptions” |

```markdown
<!-- Example once files exist:
![Pipeline](docs/screenshots/pipeline.png)
-->
```

---

## Demo (local)

1. Complete [Environment setup](#environment-setup) and start **`npm run dev:api`** and **`npm run dev:web`**.
2. Open **http://localhost:5173**, register, sign in.
3. With **no applications yet**, use **Try with sample job descriptions**: pick **Clean JD**, **Messy JD**, or **Edge-case JD** — the modal opens with that text in the paste field.
4. Click **Parse** to run the parser (OpenAI if configured, otherwise fallback). Adjust fields, save, then drag the card between columns.

To try AI features end-to-end, set **`OPENAI_API_KEY`** (and optionally **`OPENAI_MODEL`**) in `apps/api/.env` and restart the API.

---

## Testing

**Automated (API)** — From the repo root:

```bash
npm run test
```

Vitest covers: JD parse fallback path, resume-bullet schema validation, and `POST /api/auth/register` (User persistence mocked; bcrypt + JWT still run). See `apps/api/tests/`.

**Manual / review**

- **Messy JD** — Informal copy, mixed casing, noisy punctuation; confirms parser and UI behave on ugly real-world posts.
- **Edge-case JD** — Sparse, vague wording; checks empty-safe defaults and validation, not just happy-path listings.
- **No API key** — Unset `OPENAI_API_KEY` and confirm fallbacks for parse and resume bullets.
- **Pipeline** — Drag across columns, refresh, confirm status sticks; search/filter when you have enough cards.

---

## Architecture

| Decision | Rationale |
|----------|-----------|
| **Controllers vs services** | Routes stay thin; **business and AI logic live in `services/`** (e.g. `services/ai/`) so it stays testable and replaceable. |
| **Zod** | Request bodies and AI JSON outputs are validated before use; bad model output does not leak raw to clients. |
| **JWT in `localStorage`** | Straightforward for an MVP; no refresh-token flow (see [Future improvements](#future-improvements)). |
| **Monorepo** | Single install, shared TypeScript conventions; web and API version and ship independently. |
| **AI fallbacks** | JD parsing and resume bullets work without paid API calls so local dev and demos do not depend on keys. |

**Stack** — React 19, Vite, Tailwind, React Query, React Router, dnd-kit · Express, Mongoose, Zod, JWT, bcrypt, optional OpenAI SDK · MongoDB.

---

## Environment setup

**Prerequisites:** Node.js **20+**, and a **MongoDB** instance the API can reach (local, Docker, or hosted).

**1. Install**

```bash
git clone <repository-url>
cd ApplyNest
npm install
```

**2. API env**

```bash
cp .env.example apps/api/.env
```

Edit **`apps/api/.env`**. Required:

| Variable | Role |
|----------|------|
| **`MONGODB_URI`** | Connection string |
| **`JWT_SECRET`** | Signing key for access tokens — use a long random value in production |

Optional: `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `JWT_EXPIRES_SECONDS`, `OPENAI_API_KEY`, `OPENAI_MODEL`. Full template and comments: **[`.env.example`](.env.example)**.

**3. Run**

Two terminals:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

- **App:** http://localhost:5173 — Vite proxies `/api` to the API.
- **Health:** http://localhost:4000/api/health

**Web (production builds only)** — If the SPA and API are on different origins, set **`VITE_API_URL`** in `apps/web/.env` to the public API base (no trailing slash). Omit in local dev.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:web` / `npm run dev:api` | Dev servers |
| `npm run build` | Production build: web then API `tsc` |
| `npm run typecheck` | Typecheck workspaces |
| `npm run lint` | ESLint (web) |
| `npm run test` | API Vitest suite |

---

## API (quick reference)

| Area | Endpoints |
|------|-----------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer) |
| Applications | `GET/POST /api/applications`, `GET/PATCH/DELETE /api/applications/:id` (Bearer) |
| AI | `POST /api/ai/parse-job`, `POST /api/ai/resume-bullets` (Bearer) |

Request/response shapes live in route validators and `apps/api/src/services/ai/schemas.ts`.

**Production deploy (outline):** Build with `npm run build` (`apps/web/dist`, `apps/api/dist`). Serve static files; run `node apps/api/dist/server.js` with production env. Set `CORS_ORIGIN` to your web origin; set `VITE_API_URL` when building the SPA if API is on another host.

---

## Security & secrets

Do not commit real `.env` files. This repo ships **`.env.example`** only. `.gitignore` excludes env files; verify with your own secret scan before publishing.

---

## Future improvements

- Refresh tokens or short-lived access + rotation for production auth.
- Rate limits and abuse controls on auth and AI routes.
- E2E tests (Playwright or similar) for the critical path: login → create application → drag Kanban.
- Email verification and password reset.
- Observability: structured logs, metrics, tracing for API deploys.

---

## License

Private — all rights reserved unless otherwise stated by the repository owner.
