// npm run check: everything that can be verified offline, in one command.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const tests = readdirSync('tests')
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => `tests/${f}`);

const steps = [
  ['Typecheck', 'npx', ['tsc', '--noEmit']],
  ['Unit tests', process.execPath, ['--experimental-strip-types', '--no-warnings', '--test', ...tests]],
  ['Expo dependency versions', 'npx', ['expo', 'install', '--check']],
  ['Server typecheck', 'npx', ['tsc', '-p', 'server', '--noEmit']],
  ['Server tests', process.execPath, ['--experimental-strip-types', '--no-warnings', '--test', 'server/test/validate.test.ts']],
];

let failed = 0;
for (const [name, cmd, args] of steps) {
  process.stdout.write(`\n▶ ${name}\n`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, CI: '1' } });
  if (r.status !== 0) {
    failed++;
    console.error(`✖ ${name} failed`);
  } else {
    console.log(`✔ ${name}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
