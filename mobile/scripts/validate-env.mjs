import { config } from 'dotenv';

config({ path: '.env.local' });

const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
let hasError = false;

for (const key of required) {
  const value = process.env[key];
  if (!value || !value.trim()) {
    console.error(`❌ Missing ${key} in .env.local`);
    hasError = true;
  } else {
    console.log(`✅ ${key} loaded`);
  }
}

if (hasError) {
  process.exit(1);
}
