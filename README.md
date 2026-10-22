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
3. **Admin credentials** — nothing to configure. The single admin account
   (email + bcrypt hash of the password) lives in `api/_lib/auth.js`, and the
   session-signing key is derived from `POSTGRES_URL` unless `SESSION_SECRET`
   is set. To change the password:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('new-password', 12))"
   ```
   and replace `ADMIN_PASSWORD_HASH` in `api/_lib/auth.js`.
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
6. Visit `/admin/login` and sign in with the admin email and password.

**Known limitation**: `index.html`'s static SEO meta tags and JSON-LD blocks
(and `src/composables/useSEO.js`) are build-time and won't reflect edits made
in the admin panel — updating those would require SSR or a build-time content
fetch, which is out of scope for this Vite + Vercel Functions setup.
