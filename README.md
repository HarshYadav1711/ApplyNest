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

See [.env.example](.env.example). API reads `PORT`, `CORS_ORIGIN`, etc. Client dev proxy forwards `/api` to the API; for production builds set `VITE_API_URL` if the API is on another origin.

## Conventions (TBD)

_Document API versioning, auth, and deployment targets here as the project grows._

## License

Private.
