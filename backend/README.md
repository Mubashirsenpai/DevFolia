# DevFolia Backend (Render)

Backend scaffold for splitting architecture:
- Express API service
- Prisma + Neon/Postgres
- Auth endpoints (signup/login/me/logout)
- Portfolio CRUD endpoints
- Analytics endpoint
- Health endpoint

## Local run

1. Install dependencies
   - `cd backend`
   - `npm install`
2. Copy env
   - `cp .env.example .env` (or create manually on Windows)
3. Set values in `.env`:
   - `DATABASE_URL` (Neon **pooled** URL if using `-pooler` host)
   - `DIRECT_URL` (Neon **direct** URL — required for `prisma migrate`; same DB, non-pooler host)
   - `ADMIN_SESSION_SECRET`
   - `FRONTEND_ORIGIN` (your frontend URL)
4. Generate Prisma client from root schema:
   - `npm run prisma:generate`
5. Run dev server:
   - `npm run dev`

## API endpoints

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (Bearer token or `portfolio_session` cookie)
- `POST /auth/logout`
- `PUT /account/settings` (billing email, theme, custom domain rules)
- `GET /portfolio/me`
- `PUT /portfolio/profile`
- `POST /portfolio/onboarding/complete`
- CRUD:
  - `/portfolio/projects`
  - `/portfolio/skills`
  - `/portfolio/awards`
  - `/portfolio/leadership`
  - `/portfolio/experience`
  - `/portfolio/education`
- `GET /analytics/overview`

## Render setup

This repo is an **npm workspace** (`backend` is a workspace). The `prisma` CLI and `scripts/run-prisma.cjs` live at the **repository root**, so installs must run from the root or `node_modules/prisma` will be missing.

**Option A — recommended (monorepo root on Render)**

- **Root directory:** leave empty (clone root, same folder as root `package.json`).
- **Build command:** `npm ci && npm run db:generate && npm run db:migrate && npm run build --workspace devfolia-backend` (adjust migrate if you use `SKIP_PRISMA_MIGRATE` elsewhere).
- **Start command:** `npm run start --workspace devfolia-backend` (or `node backend/dist/index.js` from root after `cd backend` only if your build outputs there — match your `tsc` `outDir`).

**Option B — Root directory `backend` only**

- **Build command:** install from parent first, e.g. `cd .. && npm ci && npm run db:generate && npm run db:migrate && cd backend && npm run build` so Prisma exists under the root `node_modules`.

Previously (root = `backend` + `npm install` only inside `backend`), `npm run prisma:generate` could not find the Prisma package because it is not a dependency of `backend/package.json`.
- Environment variables (all required for a successful start):
  - `FRONTEND_ORIGIN` — **your Vercel site origin only** (e.g. `https://your-app.vercel.app`). Same as `FRONTEND_URL` or `CORS_ORIGIN` if you prefer. No path, no trailing slash. Without one of these, the process exits on boot.
  - `NODE_ENV=production`
  - `PORT` (Render sets this automatically)
  - `DATABASE_URL=<neon-pooled-url>` (recommended for runtime)
  - `DIRECT_URL=<neon-direct-url>` (needed for **`prisma migrate`** on deploy; avoids P1002 / advisory-lock timeouts through the pooler)
  - `ADMIN_SESSION_SECRET=<same-secret-used-across-app>`

## Vercel (frontend) env

Use the **same** `ADMIN_SESSION_SECRET` as Render so JWTs from `/auth/login` verify in the Next.js app (session / proxy).

- `NEXT_PUBLIC_API_URL=https://your-service.onrender.com` — login/signup and public portfolio fallback call this URL from the browser or server.

Optional server-only duplicate (already supported):

- `BACKEND_API_URL` — same as above; useful if you prefer not exposing the URL to the client for server-side fetches only. For split login/signup from the browser, **`NEXT_PUBLIC_API_URL` must be set**.
