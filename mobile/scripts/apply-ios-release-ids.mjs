#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

const appJsonPath = new URL('../app.json', import.meta.url);
const easJsonPath = new URL('../eas.json', import.meta.url);

const requiredEnv = {
  IOS_EAS_PROJECT_ID: process.env.IOS_EAS_PROJECT_ID,
  IOS_ASC_APP_ID: process.env.IOS_ASC_APP_ID,
  IOS_APPLE_TEAM_ID: process.env.IOS_APPLE_TEAM_ID,
};

const missing = Object.entries(requiredEnv)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.error(`❌ Missing required vars: ${missing.join(', ')}`);
  process.exit(1);
}

const [appRaw, easRaw] = await Promise.all([
  readFile(appJsonPath, 'utf8'),
  readFile(easJsonPath, 'utf8'),
]);

const app = JSON.parse(appRaw);
const eas = JSON.parse(easRaw);

app.expo ??= {};
app.expo.extra ??= {};
app.expo.extra.eas ??= {};
app.expo.extra.eas.projectId = requiredEnv.IOS_EAS_PROJECT_ID;

eas.submit ??= {};
eas.submit.production ??= {};
eas.submit.production.ios ??= {};
eas.submit.production.ios.ascAppId = requiredEnv.IOS_ASC_APP_ID;
eas.submit.production.ios.appleTeamId = requiredEnv.IOS_APPLE_TEAM_ID;

await Promise.all([
  writeFile(appJsonPath, `${JSON.stringify(app, null, 2)}\n`),
  writeFile(easJsonPath, `${JSON.stringify(eas, null, 2)}\n`),
]);

console.log('✅ iOS release IDs applied into app.json/eas.json');
