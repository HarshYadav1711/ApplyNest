# ApplyNest

Monorepo for the ApplyNest product: a **Vite + React + TypeScript** web app and a **Node + Express + TypeScript** API.

## Structure

| Path | Role |
|------|------|
| `apps/web` | SPA — `components`, `pages`, `hooks`, `api`, `utils` |
| `apps/api` | HTTP API — `controllers`, `routes`, `services`, `models`, `middleware`, `validators`, `utils` |

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
```

Copy environment defaults:

```bash
cp .env.example apps/api/.env
```

## Scripts (root)

| Script | Description |
|--------|-------------|
| `npm run dev:web` | Vite dev server (`apps/web`, port 5173) |
| `npm run dev:api` | API with watch (`apps/api`, port 4000) |
| `npm run build` | Production build — web then API |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run lint` | Lint web (extend for API as needed) |

Run **web** and **api** in two terminals for full-stack local dev.

## Environment

See [.env.example](.env.example). Required for the API: `MONGODB_URI`, `JWT_SECRET`. Optional: `JWT_EXPIRES_SECONDS`, `CORS_ORIGIN`. The web app proxies `/api` to the API in dev; for production builds set `VITE_API_URL` when the API is on another origin.

## Authentication

- **API**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer JWT). Passwords hashed with bcrypt; tokens signed with `JWT_SECRET`.
- **Web**: JWT in `localStorage`, `AuthProvider` + `useAuth()` bootstrap session via `/me` after refresh. `ProtectedRoute` guards `/`. Logout clears token and query cache.

## Conventions (TBD)

_Document API versioning and deployment targets here as the project grows._

## License

Private.
