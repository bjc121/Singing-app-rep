# Vendoring scoped packages

This environment blocks scoped packages (e.g., `@supabase/*`, `@upstash/*`, `@types/*`) from the npm registry. Scoped deps are pinned to `file:vendor/*.tgz` so installs succeed once tarballs are provided.

## TL;DR
1. Generate the pack list on a machine with registry access:
   ```bash
   npm run vendor:packlist > vendor/packlist.txt
   ```
2. Ensure the pack list is in sync:
   ```bash
   npm run vendor:check
   ```
3. On that machine, run the commands from `vendor/packlist.txt` to produce tarballs.
4. Copy the resulting `vendor/*.tgz` files into this repo.
5. In the restricted environment, verify the tarballs and install:
   ```bash
   # Enforce tarball presence (and a current vendor/packlist.txt) only when OFFLINE_INSTALL=1
   OFFLINE_INSTALL=1 npm run vendor:verify
   npm install --no-package-lock
   ```

## How the pack list is built
- `npm run vendor:packlist` scans `dependencies` and `devDependencies` for `@scope/*` packages in `package.json` and prints `npm pack ...` commands for each version.
- `npm run vendor:check` ensures `vendor/packlist.txt` exists and matches the current scoped dependencies.
- `npm run vendor:verify` checks that scoped packages use `file:vendor/*.tgz` specs, that `vendor/packlist.txt` is current, and reports missing tarballs. When `OFFLINE_INSTALL=1`, missing tarballs or an out-of-date packlist cause the command to exit non-zero; otherwise, it warns and exits 0.

## Adding/updating scoped dependencies
- Keep the `file:vendor/<package-without-scope>-<version>.tgz` pattern when updating versions in `package.json` so the scripts can infer the correct pack command.
- After changing versions, rerun `npm run vendor:packlist` to refresh `vendor/packlist.txt` for whoever has registry access.
