#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve(process.cwd(), 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('package.json not found');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const vendorDir = path.resolve(process.cwd(), 'vendor');

function getScopedEntries() {
  const groups = ['dependencies', 'devDependencies'];
  const entries = [];
  for (const group of groups) {
    const deps = pkg[group] || {};
    for (const [name, spec] of Object.entries(deps)) {
      if (name.startsWith('@')) {
        entries.push({ name, spec, group });
      }
    }
  }
  return entries;
}

function parseVersionFromSpec(spec) {
  const fileSpec = spec.startsWith('file:') ? spec.replace(/^file:/, '') : null;
  if (fileSpec) {
    const base = path.basename(fileSpec);
    const match = base.match(/-(\d+\.\d+\.\d+(?:-[^\.]+)?)\.tgz$/);
    if (match) return match[1];
  }
  if (/^\d+\.\d+\.\d+/.test(spec)) return spec;
  throw new Error(`Unable to infer version from spec: ${spec}`);
}

function buildPacklistLines(entries) {
  if (!entries.length) {
    return ['# No scoped dependencies found.'];
  }
  const lines = [
    '# Run these on a networked machine to produce vendor tarballs:',
    'mkdir -p vendor',
  ];
  for (const { name, spec } of entries) {
    const version = parseVersionFromSpec(spec);
    lines.push(`npm pack ${name}@${version}`);
  }
  lines.push('\n# Copy the generated .tgz files into ./vendor, then run:\n# npm install --no-package-lock');
  return lines;
}

function getPacklistState(entries) {
  const packlistPath = path.join(vendorDir, 'packlist.txt');
  const expected = buildPacklistLines(entries).join('\n').trim();
  if (!entries.length) {
    return { ok: true, expected, packlistPath };
  }
  if (!fs.existsSync(packlistPath)) {
    return { ok: false, missing: true, expected, packlistPath };
  }
  const actual = fs.readFileSync(packlistPath, 'utf8').trim();
  return { ok: actual === expected, missing: false, expected, packlistPath };
}

function packlist() {
  const lines = buildPacklistLines(getScopedEntries());
  console.log(lines.join('\n'));
}

function check() {
  const entries = getScopedEntries();
  const state = getPacklistState(entries);
  if (!entries.length) {
    console.log('No scoped dependencies declared; nothing to vendor.');
    return;
  }
  if (!state.ok) {
    const msg = state.missing
      ? 'vendor/packlist.txt is missing. Regenerate with: npm run vendor:packlist > vendor/packlist.txt'
      : 'vendor/packlist.txt is out of date. Regenerate with: npm run vendor:packlist > vendor/packlist.txt';
    console.error(msg);
    process.exit(1);
  }
  console.log('vendor/packlist.txt matches package.json scoped dependencies.');
}

function verify() {
  const enforceTarballs = process.env.OFFLINE_INSTALL === '1';
  const entries = getScopedEntries();
  if (!entries.length) {
    console.log('No scoped dependencies declared.');
    return;
  }

  const packlistState = getPacklistState(entries);
  if (!packlistState.ok) {
    const msg = packlistState.missing
      ? 'vendor/packlist.txt is missing. Regenerate with: npm run vendor:packlist > vendor/packlist.txt'
      : 'vendor/packlist.txt is out of date. Regenerate with: npm run vendor:packlist > vendor/packlist.txt';
    if (enforceTarballs) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(msg);
  }

  if (!fs.existsSync(vendorDir)) {
    const message = 'vendor directory is missing. Create it and add packed tarballs.';
    if (enforceTarballs) {
      console.error(message);
      process.exit(1);
    }
    console.warn(message);
    console.warn('OFFLINE_INSTALL is not set; skipping tarball enforcement.');
    return;
  }
  const missing = [];
  for (const { spec, name } of entries) {
    if (!spec.startsWith('file:')) {
      const msg = `Scoped dependency ${name} is not a file: vendor spec. Update package.json.`;
      if (enforceTarballs) {
        console.error(msg);
        missing.push(name);
        continue;
      }
      console.warn(msg);
      continue;
    }
    const targetPath = path.resolve(process.cwd(), spec.replace(/^file:/, ''));
    if (!fs.existsSync(targetPath)) {
      const relPath = path.relative(process.cwd(), targetPath);
      missing.push({ name, relPath });
    }
  }
  if (missing.length) {
    console[(enforceTarballs ? 'error' : 'warn')]('Missing vendor tarballs:');
    missing.forEach(({ name, relPath }) => {
      console[(enforceTarballs ? 'error' : 'warn')](` - ${name}: place tarball at ${relPath}`);
    });
    if (enforceTarballs) {
      process.exit(1);
    }
    console.warn('OFFLINE_INSTALL is not set; skipping tarball enforcement.');
    return;
  }
  console.log('All scoped dependencies have vendor tarballs present and vendor/packlist.txt is current.');
}

const mode = process.argv[2];
if (mode === 'packlist') {
  packlist();
} else if (mode === 'check') {
  check();
} else if (mode === 'verify') {
  verify();
} else {
  console.error('Usage: node scripts/vendor-utils.mjs [packlist|check|verify]');
  process.exit(1);
}
