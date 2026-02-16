import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, anon);

try {
  const { error: healthError } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  if (healthError) throw healthError;
  console.log('✅ Supabase reachable');

  const { error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  console.log('✅ auth.getSession ok');

  console.log('✅ profiles table reachable');
} catch (error) {
  console.error('❌ Smoke validation failed:', error.message || error);
  process.exit(1);
}
