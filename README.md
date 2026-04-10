# ApplyNest

AI-assisted job application tracker: email/password auth, JWT-protected API, a five-column Kanban board, drag-and-drop status updates, CRUD for applications, and optional OpenAI-powered job-description parsing plus resume bullet suggestions (with safe deterministic fallbacks when no API key is configured).

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas URI)

## Quick start

### 1. Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET (and optionally OPENAI_API_KEY)
npm install
npm run dev
```

API listens on `http://localhost:4000` (configurable via `PORT`). Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend on port 4000.

For a production build of the SPA, set `VITE_API_URL` to your API origin (e.g. `https://api.example.com`) so requests go to the correct host.

## Environment variables

See [.env.example](.env.example) for all variables. Summary:

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_EXPIRES_SECONDS` | No | Access token lifetime (default 604800 = 7 days) |
| `PORT` | No | API port (default 4000) |
| `CORS_ORIGIN` | No | Allowed browser origin (default `http://localhost:5173`) |
| `OPENAI_API_KEY` | No | If set, enables OpenAI for parsing and bullets; otherwise fallbacks run |
| `OPENAI_MODEL` | No | Model name (default `gpt-4o-mini`) |
| `VITE_API_URL` | No | Frontend API base URL; omit in dev to use the Vite proxy |

## Architecture (design choices)

- **Backend**: Express + TypeScript, Mongoose, Zod on every inbound body/params payload. Routes stay thin; controllers call services; AI lives only under `services/ai` with Zod-validated outputs and fallbacks so invalid model JSON never propagates.
- **Auth**: Access JWT stored in `localStorage`, sent as `Authorization: Bearer`. On load, `GET /api/auth/me` restores the session after refresh. A 401 on an authenticated request clears storage and notifies the UI so the shell stays consistent.
- **Kanban**: Exactly five fixed stages (`Applied`, `Phone Screen`, `Interview`, `Offer`, `Rejected`), shared as constants on server and client. Drag-and-drop uses `@dnd-kit`; dropping on a column or another card resolves the target stage; status updates use optimistic cache updates with React Query.
- **AI**: Provider-agnostic flow in code: OpenAI chat completions with JSON mode when `OPENAI_API_KEY` is set; otherwise deterministic parsing and template bullets. All structured responses pass through Zod before use.
- **Frontend**: React Query for server state, small UI primitives, modal-based create/edit, and explicit loading, empty, and error states on the board and forms.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `backend` | `npm run dev` | `tsx watch` API server |
| `backend` | `npm run build` | Compile to `dist/` |
| `frontend` | `npm run dev` | Vite dev server |
| `frontend` | `npm run build` | Production client build |

## License

Private / assessment use.
