import { readFile } from 'node:fs/promises';

const appConfigRaw = await readFile(new URL('../app.json', import.meta.url), 'utf8');
const easConfigRaw = await readFile(new URL('../eas.json', import.meta.url), 'utf8');

const app = JSON.parse(appConfigRaw);
const eas = JSON.parse(easConfigRaw);

const expo = app.expo ?? {};
const ios = expo.ios ?? {};
const extra = expo.extra?.eas ?? {};

const failures = [];

if (!expo.name || expo.name === 'mobile') failures.push('expo.name debe ser nombre final de app.');
if (!expo.slug || expo.slug === 'mobile') failures.push('expo.slug no debe quedarse como "mobile".');
if (!ios.bundleIdentifier || ios.bundleIdentifier.includes('REPLACE')) failures.push('ios.bundleIdentifier inválido o placeholder.');
if (!ios.buildNumber) failures.push('ios.buildNumber faltante.');
if (!extra.projectId || String(extra.projectId).includes('REPLACE')) failures.push('expo.extra.eas.projectId sigue en placeholder.');

const prodSubmit = eas.submit?.production?.ios ?? {};
if (!prodSubmit.ascAppId || String(prodSubmit.ascAppId).includes('REPLACE')) failures.push('submit.production.ios.ascAppId en placeholder.');
if (!prodSubmit.appleTeamId || String(prodSubmit.appleTeamId).includes('REPLACE')) failures.push('submit.production.ios.appleTeamId en placeholder.');

if (failures.length) {
  console.error('❌ iOS release config incompleto:');
  failures.forEach((f, i) => console.error(`${i + 1}. ${f}`));
  process.exit(1);
}

console.log('✅ iOS release config base lista para EAS/TestFlight.');
