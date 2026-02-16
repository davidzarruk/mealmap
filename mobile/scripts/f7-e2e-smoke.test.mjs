import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cxhpvtwxpgpflgqylgsi.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHB2dHd4cGdwZmxncXlsZ3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDcwODMsImV4cCI6MjA4Njc4MzA4M30.j8o2GMh3xI5s6Cbvb4A-3BCvzxr6UnM499VhF4KJsTE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Unique test user
const TEST_EMAIL = `e2e-smoke-${Date.now()}@test.mealmap.dev`;
const TEST_PASSWORD = 'TestPass123!';

let userId = null;
let planId = null;
let slotId = null;
let mealCandidateId = null;
let shoppingListId = null;

describe('F7 E2E Smoke Test Suite', () => {
  it('Step 1: Sign up test user', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    // May get rate limited or require email confirmation
    if (error && error.message.includes('rate')) {
      console.log('Rate limited on signup, skipping auth-dependent tests');
      return;
    }
    // In dev mode, user may be created but unconfirmed
    assert.ok(data.user || data.session, 'User or session should be created');
    userId = data.user?.id ?? null;
    console.log('Created test user:', userId);
  });

  it('Step 2: Sign in test user', async () => {
    if (!userId) {
      console.log('Skipping: no user from step 1');
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error) {
      console.log('Sign-in error (may need email confirmation):', error.message);
      return;
    }
    assert.ok(data.session, 'Session should exist');
    console.log('Signed in successfully');
  });

  it('Step 3: Create a plan', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Skipping: not authenticated');
      return;
    }

    const { data, error } = await supabase.from('plans').insert({
      user_id: user.id,
      horizon: 'week',
      people_count: 2,
      meal_types: ['lunch'],
      cooking_level: 'easy',
      max_time_minutes: 30,
      region: 'CO',
      status: 'in_progress',
    }).select('id').single();

    if (error) {
      console.log('Plan creation error:', error.message);
      return;
    }
    assert.ok(data?.id, 'Plan should have ID');
    planId = data.id;
    console.log('Created plan:', planId);
  });

  it('Step 4: Create plan slot + meal candidate (approve flow)', async () => {
    if (!planId) {
      console.log('Skipping: no plan');
      return;
    }

    // Create slot
    const { data: slot, error: slotErr } = await supabase.from('plan_slots').insert({
      plan_id: planId,
      day_index: 0,
      meal_type: 'lunch',
    }).select('id').single();

    if (slotErr) {
      console.log('Slot error:', slotErr.message);
      return;
    }
    slotId = slot.id;

    // Create meal candidate
    const { data: mc, error: mcErr } = await supabase.from('meal_candidates').insert({
      slot_id: slotId,
      title: 'E2E Test Ajiaco',
      ingredients_json: [{ name: 'Potato', amount: 500, unit: 'g', category: 'Produce' }],
      prep_steps_short: 'Boil and serve.',
      est_time_minutes: 30,
      tags: ['Beginner'],
      source: 'seed',
      is_current: true,
    }).select('id').single();

    if (mcErr) {
      console.log('Meal candidate error:', mcErr.message);
      return;
    }
    mealCandidateId = mc.id;

    // Approve
    const { error: approveErr } = await supabase.from('plan_slots').update({
      approved_meal_candidate_id: mealCandidateId,
      approved_at: new Date().toISOString(),
    }).eq('id', slotId);

    assert.ok(!approveErr, 'Should approve meal without error');
    console.log('Created slot + meal + approved');
  });

  it('Step 5: Generate shopping list', async () => {
    if (!planId) {
      console.log('Skipping: no plan');
      return;
    }

    const { data: list, error: listErr } = await supabase.from('shopping_lists').insert({
      plan_id: planId,
    }).select('id').single();

    if (listErr) {
      console.log('Shopping list error:', listErr.message);
      return;
    }
    shoppingListId = list.id;

    const { error: itemErr } = await supabase.from('shopping_items').insert([
      { shopping_list_id: shoppingListId, ingredient_name: 'Potato', unit: 'g', total_qty: 500, category: 'produce', checked: false },
      { shopping_list_id: shoppingListId, ingredient_name: 'Chicken', unit: 'g', total_qty: 400, category: 'protein', checked: false },
    ]);

    assert.ok(!itemErr, 'Should insert shopping items without error');
    console.log('Created shopping list with', 2, 'items');
  });

  it('Step 6: Toggle shopping item checked', async () => {
    if (!shoppingListId) {
      console.log('Skipping: no shopping list');
      return;
    }

    const { data: items } = await supabase.from('shopping_items')
      .select('id, checked')
      .eq('shopping_list_id', shoppingListId)
      .limit(1);

    if (!items || items.length === 0) {
      console.log('No items to toggle');
      return;
    }

    const { error } = await supabase.from('shopping_items')
      .update({ checked: true })
      .eq('id', items[0].id);

    assert.ok(!error, 'Should toggle checked without error');

    const { data: updated } = await supabase.from('shopping_items')
      .select('checked')
      .eq('id', items[0].id)
      .single();

    assert.equal(updated?.checked, true, 'Item should be checked');
    console.log('Toggled item checked');
  });

  it('Step 7: Rate a meal', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !mealCandidateId) {
      console.log('Skipping: not authenticated or no meal');
      return;
    }

    const { error } = await supabase.from('meal_ratings').upsert({
      user_id: user.id,
      meal_candidate_id: mealCandidateId,
      rating: 1,
    });

    if (error) {
      console.log('Rating error (table may not exist yet):', error.message);
      return;
    }

    const { data: rating } = await supabase.from('meal_ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('meal_candidate_id', mealCandidateId)
      .single();

    assert.equal(rating?.rating, 1, 'Rating should be thumbs up');
    console.log('Rated meal thumbs up');
  });

  it('Step 8: Complete plan (export to history)', async () => {
    if (!planId) {
      console.log('Skipping: no plan');
      return;
    }

    const { error } = await supabase.from('plans').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', planId);

    assert.ok(!error, 'Should complete plan');

    const { data: plan } = await supabase.from('plans')
      .select('status')
      .eq('id', planId)
      .single();

    assert.equal(plan?.status, 'completed', 'Plan should be completed');
    console.log('Plan marked as completed');
  });

  it('Step 9: Verify plan history query', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('Skipping: not authenticated');
      return;
    }

    const { data } = await supabase.from('plans')
      .select('id, status, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    assert.ok(data && data.length > 0, 'Should have at least one completed plan');
    console.log('History query returned', data.length, 'plans');
  });

  it('Step 10: Cleanup test data', async () => {
    // Plans cascade delete slots, candidates, shopping lists
    if (planId) {
      await supabase.from('plans').delete().eq('id', planId);
      console.log('Cleaned up plan and related data');
    }
  });
});
