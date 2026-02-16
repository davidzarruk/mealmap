import { execSync } from 'node:child_process';

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

const isMac = process.platform === 'darwin';

console.log('[smoke:ios] starting iPhone simulator smoke checks');
run('npm run -s typecheck');
run('node --test scripts/setup-validation.test.mjs scripts/plan-integration.test.mjs');

if (!isMac) {
  console.log('[smoke:ios] skipped simulator launch: host is not macOS, iPhone simulator unavailable');
  process.exit(0);
}

try {
  run('xcrun simctl list devices available | head -n 40');
  run('npx expo start --ios --non-interactive');
} catch (error) {
  console.error('[smoke:ios] failed while launching iPhone simulator');
  process.exit(1);
}
