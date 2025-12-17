# Agent instructions (Singing Coach MVP)
## Quick start
- Install: `npm install`
- Dev: `npm run dev`
- Tests: `npm test`
## Notes
- Prisma has been removed to avoid 403 install issues.
- This environment blocks scoped packages like `@supabase/auth-helpers-nextjs`. Scoped deps are pinned to `file:vendor/*.tgz`.
- Before running installs, generate tarballs on a networked machine (`npm run vendor:packlist`), ensure `vendor/packlist.txt` is current (`npm run vendor:check`), drop them into `vendor/`, then run `OFFLINE_INSTALL=1 npm run vendor:verify` and `npm install --no-package-lock` here. Without `OFFLINE_INSTALL=1`, `vendor:verify` only warns about missing tarballs or a stale packlist.
