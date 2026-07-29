# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## Admin back-office setup

The site content (CV, bio, timeline, skills, projects, testimonials, social links,
contact info) is editable at `/admin` instead of being hardcoded, backed by
Vercel Postgres/Neon + Vercel Blob.

1. **Attach integrations** — in the Vercel project dashboard, add the
   **Postgres** (Neon) and **Blob** storage integrations. This auto-injects
   `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` into the project's env vars.
2. **Pull env vars locally**:
   ```bash
   npm i -g vercel   # if not already installed
   vercel link
   vercel env pull .env.local
   ```
3. **Generate the admin credentials** and add them to both `.env.local` and the
   Vercel dashboard (Production + Preview):
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"   # -> ADMIN_PASSWORD_HASH
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # -> SESSION_SECRET
   ```
   See `.env.example` for the full list of required variables.
4. **Create the schema and seed today's content**:
   ```bash
   npm run db:seed
   ```
   Safe to re-run — it skips any table that already has rows, and it
   regenerates `src/content/fallback.json` (the offline snapshot the public
   site falls back to if `/api/content` is ever unreachable).
5. **Run locally with the API**:
   ```bash
   npm run dev:api   # vercel dev — serves both the Vite app and /api/*
   ```
   (`npm run dev` still works for pure frontend/UI iteration, but `/admin`
   won't be able to reach the API without `vercel dev`.)
6. Visit `/admin/login` and sign in with the password you hashed in step 3.

**Known limitation**: `index.html`'s static SEO meta tags and JSON-LD blocks
(and `src/composables/useSEO.js`) are build-time and won't reflect edits made
in the admin panel — updating those would require SSR or a build-time content
fetch, which is out of scope for this Vite + Vercel Functions setup.
