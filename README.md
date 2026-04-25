# DevFolia (multi-user portfolio SaaS)

DevFolia lets users sign up, manage their portfolio content, and share a public profile link at `/{username}`. Users can manage **projects**, **skills**, **experience**, **education**, **awards**, **leadership**, social links, profile photo, and CV uploads from their dashboard.

## Stack (why this choice)

| Layer | Choice | Reason |
|--------|--------|--------|
| **Framework** | **Next.js 16 (App Router)** | One codebase for public pages + admin, SEO-friendly, fast. |
| **Language** | **TypeScript** | Safer refactors as your content model grows. |
| **UI** | **Tailwind CSS v4** | Quick, consistent styling for a personal site. |
| **Database** | **SQLite + Prisma** | Zero extra servers for local/small deploys; one file DB. |
| **Auth** | **Email/password + signed cookie (jose)** | Per-user dashboard sessions and isolated content. |
| **Uploads** | **Local disk** (`public/uploads`) | Simple image hosting on a VPS or your machine. |

For **serverless** hosts (e.g. Vercel), SQLite and local file writes are **not** ideal. Use **PostgreSQL** (Neon, Supabase, etc.) + **S3 / Vercel Blob / Cloudinary** for images instead.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — default `file:./prisma/dev.db` is fine locally.
   - `ADMIN_SESSION_SECRET` — at least **32 random characters** (used to sign the session cookie).

3. **Database**

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   (Already run once if you cloned after first setup.)

4. **Dev server**

   ```bash
   npm run dev
   ```

   - Marketing home: [http://localhost:3000](http://localhost:3000)
   - Sign up: [http://localhost:3000/admin/signup](http://localhost:3000/admin/signup)
   - Sign in: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - Public profile format: `http://localhost:3000/<username>`

## Dashboard features

- **Profile** — name, headline, bio, contact links, resume upload, social links, **profile photo upload**.
- **Projects** — title, description, **status**, optional **image**, demo/repo URLs, sort order.
- **Skills** — e.g. “Python”, category “Backend”, **level** slider 0–100, short example text.
- **Experience / Education** — résumé sections.
- **Awards / Leadership** — text + optional **images**.
- **Onboarding** — guided first setup after signup.
- **Analytics** — profile views and 14-day chart.
- **Settings** — plan selection, billing email, theme, and custom domain verification.

Uploaded images are stored under `public/uploads/` (ignored by git except `.gitkeep`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development |
| `npm run build` / `npm start` | Production |
| `npm run db:studio` | Prisma GUI for the DB |
| `npm run db:push` | Push schema changes (dev) |

## Billing and domain setup

Set these env vars to enable Stripe billing:

- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`

Webhook endpoint:

- `/api/billing/webhook`

Custom domains are verified via TXT record:

- `devfolia-verify=<token shown in settings>`

## Deploying

- **VPS / Docker / Node host with disk**: SQLite + `public/uploads` work if the filesystem persists.
- **Vercel / Netlify serverless**: migrate to **Postgres** + **blob storage** for uploads.

---

Customize copy/colors in `src/app/globals.css`. DevFolia landing is `src/app/page.tsx`, and user public pages are served from `src/app/[username]/page.tsx`.
