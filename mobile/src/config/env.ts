const DEFAULTS: Record<string, string> = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://cxhpvtwxpgpflgqylgsi.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHB2dHd4cGdwZmxncXlsZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDcwODMsImV4cCI6MjA4Njc4MzA4M30.j8o2GMh3xI5s6Cbvb4A-3BCvzxr6UnM499VhF4KJsTE',
};

function getEnv(name: 'EXPO_PUBLIC_SUPABASE_URL' | 'EXPO_PUBLIC_SUPABASE_ANON_KEY'): string {
  return process.env[name] || DEFAULTS[name];
}

export const env = {
  supabaseUrl: getEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
};
