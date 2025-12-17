# Singing Coach MVP

Production-ready Next.js App Router MVP for recording, scoring, and tracking vocal takes with Supabase, OpenAI, and QStash.

## Getting started

1. Install dependencies
   Scoped packages (`@supabase/*`, `@upstash/*`, `@types/*`) are blocked in this environment. They are pinned to `file:vendor/*.tgz`; provide tarballs before installing:

   ```bash
   # On a machine with registry access
   npm run vendor:packlist > vendor/packlist.txt
   npm run vendor:check
   cd vendor && bash packlist.txt && cd ..

   # Copy vendor/*.tgz into this repo (commit or transfer securely)

   # In the restricted environment
   # Set OFFLINE_INSTALL=1 to enforce tarball presence and a current vendor/packlist.txt;
   # without it, verify will warn but exit 0.
   OFFLINE_INSTALL=1 npm run vendor:verify
   npm install --no-package-lock
   ```

   If you cannot vendor tarballs, you must replace the scoped dependencies with unscoped alternatives before installs will succeed. Prisma packages were already removed for this reason.
2. Configure environment variables (copy `.env.example` to `.env.local`).
3. Start the dev server
```bash
npm run dev
```

## Features wired
- Supabase Auth UI for login/signup
- API routes for recordings lifecycle (create, commit, list, detail, redo, delete)
- QStash-driven scoring job that transcribes, extracts DSP features, and requests structured coaching JSON from OpenAI
- Trendline API + Recharts client to visualize progress
- App pages for dashboard, recording, progress, and recording detail placeholders
