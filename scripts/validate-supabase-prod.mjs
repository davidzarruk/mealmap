import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const required = [
  ['SUPABASE_URL | EXPO_PUBLIC_SUPABASE_URL', url],
  ['SUPABASE_ANON_KEY | EXPO_PUBLIC_SUPABASE_ANON_KEY', anon],
];

const missing = required.filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('❌ Faltan variables:', missing.join(', '));
  process.exit(1);
}

const anonClient = createClient(url, anon, { auth: { persistSession: false } });
const serviceClient = serviceRole
  ? createClient(url, serviceRole, { auth: { persistSession: false } })
  : null;

async function checkHealth() {
  const health = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  if (!health.ok) throw new Error(`REST API no responde OK (${health.status})`);
}

async function checkTablesReadable() {
  const [profiles, plans] = await Promise.all([
    anonClient.from('profiles').select('id', { count: 'exact', head: true }),
    anonClient.from('plans').select('id', { count: 'exact', head: true }),
  ]);

  if (profiles.error) throw new Error(`profiles check: ${profiles.error.message}`);
  if (plans.error) throw new Error(`plans check: ${plans.error.message}`);
}

async function checkKanbanCatalog() {
  const resp = await fetch(`${url}/rest/v1/ticket_events?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  if (resp.status === 404) {
    throw new Error('tabla ticket_events no encontrada (migración kanban_live ausente)');
  }
}

async function createTempUser(prefix) {
  const email = `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.mealmap.app`;
  const password = `Mealmap#${Math.random().toString(36).slice(2, 10)}A1`;

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw new Error(`createUser(${prefix}) falló: ${error.message}`);
  return { id: data.user.id, email, password };
}

async function cleanupTempUsers(ids) {
  for (const id of ids) {
    const { error } = await serviceClient.auth.admin.deleteUser(id);
    if (error) {
      console.warn(`⚠️ cleanup deleteUser(${id}) falló: ${error.message}`);
    }
  }
}

async function checkRlsIsolationWithServiceRole() {
  const createdUserIds = [];
  try {
    const [u1, u2] = await Promise.all([createTempUser('rls-a'), createTempUser('rls-b')]);
    createdUserIds.push(u1.id, u2.id);

    const [insertP1, insertP2] = await Promise.all([
      serviceClient.from('plans').insert({
        user_id: u1.id,
        horizon: 'week',
        people_count: 2,
        meal_types: ['lunch'],
        cooking_level: 'easy',
        max_time_minutes: 30,
        region: 'CO',
        status: 'draft',
      }),
      serviceClient.from('plans').insert({
        user_id: u2.id,
        horizon: 'week',
        people_count: 3,
        meal_types: ['lunch', 'dinner'],
        cooking_level: 'intermediate',
        max_time_minutes: 45,
        region: 'CO',
        status: 'draft',
      }),
    ]);

    if (insertP1.error) throw new Error(`insert plan user1 falló: ${insertP1.error.message}`);
    if (insertP2.error) throw new Error(`insert plan user2 falló: ${insertP2.error.message}`);

    const user1Client = createClient(url, anon, { auth: { persistSession: false } });
    const { data: signIn1, error: signErr1 } = await user1Client.auth.signInWithPassword({
      email: u1.email,
      password: u1.password,
    });
    if (signErr1) throw new Error(`signIn user1 falló: ${signErr1.message}`);
    if (!signIn1.session) throw new Error('signIn user1 sin sesión activa');

    const ownRows = await user1Client
      .from('plans')
      .select('id,user_id')
      .eq('user_id', u1.id)
      .limit(5);

    if (ownRows.error) throw new Error(`select own rows falló: ${ownRows.error.message}`);
    if (!ownRows.data?.length) throw new Error('RLS check falló: user1 no ve sus planes');

    const foreignRows = await user1Client
      .from('plans')
      .select('id,user_id')
      .eq('user_id', u2.id)
      .limit(5);

    if (foreignRows.error) throw new Error(`select foreign rows falló: ${foreignRows.error.message}`);
    if ((foreignRows.data?.length || 0) > 0) {
      throw new Error('RLS check falló: user1 pudo leer planes de user2');
    }

    const ownRowId = ownRows.data[0].id;
    const { error: tamperError } = await user1Client
      .from('plans')
      .update({ user_id: u2.id })
      .eq('id', ownRowId);

    if (!tamperError) {
      throw new Error('RLS check falló: update malicioso user_id no fue bloqueado');
    }
  } finally {
    await cleanupTempUsers(createdUserIds);
  }
}

await checkHealth();
await checkTablesReadable();
await checkKanbanCatalog();

if (serviceClient) {
  await checkRlsIsolationWithServiceRole();
  console.log('✅ Supabase prod deep check OK (baseline + RLS isolation con service_role).');
} else {
  console.log('✅ Supabase prod baseline OK (REST + tablas core + kanban catalog).');
  console.log('ℹ️ Deep checks omitidos: define SUPABASE_SERVICE_ROLE_KEY para validar RLS isolation end-to-end.');
}
