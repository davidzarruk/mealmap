import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approveTopCard,
  getPendingCards,
  replaceTopCard,
  consolidateIngredients,
} from '../src/domain/planFlow.mjs';

const weekMealsFixture = {
  Mon: [
    {
      id: 'mon-1',
      title: 'Meal 1',
      level: 'Beginner',
      prepTimeMin: 20,
      ingredients: [
        { name: 'Rice', amount: 200, unit: 'g', category: 'Pantry' },
        { name: 'Chicken breast', amount: 300, unit: 'g', category: 'Protein' },
      ],
    },
    {
      id: 'mon-2',
      title: 'Meal 2',
      level: 'Beginner',
      prepTimeMin: 25,
      ingredients: [{ name: 'Rice', amount: 100, unit: 'g', category: 'Pantry' }],
    },
  ],
  Tue: [
    {
      id: 'tue-1',
      title: 'Meal 3',
      level: 'Intermediate',
      prepTimeMin: 30,
      ingredients: [{ name: 'Chicken breast', amount: 200, unit: 'g', category: 'Protein' }],
    },
  ],
};

const replacementPoolFixture = {
  Mon: [
    {
      id: 'mon-r1',
      title: 'Replacement compatible',
      level: 'Beginner',
      prepTimeMin: 22,
      ingredients: [{ name: 'Rice', amount: 50, unit: 'g', category: 'Pantry' }],
    },
    {
      id: 'mon-r2',
      title: 'Replacement fallback',
      level: 'Intermediate',
      prepTimeMin: 24,
      ingredients: [{ name: 'Beans', amount: 200, unit: 'g', category: 'Pantry' }],
    },
  ],
};

test('T-TST-02 integration: create plan + approve all pending cards', () => {
  const selectedDay = 'Mon';
  let approvedIds = [];

  approvedIds = approveTopCard({ weekMeals: weekMealsFixture, selectedDay, approvedIds });
  approvedIds = approveTopCard({ weekMeals: weekMealsFixture, selectedDay, approvedIds });
  approvedIds = approveTopCard({ weekMeals: weekMealsFixture, selectedDay, approvedIds });

  const pending = getPendingCards(weekMealsFixture, selectedDay, approvedIds);
  assert.deepEqual(approvedIds, ['mon-1', 'mon-2']);
  assert.equal(pending.length, 0);
});

test('T-TST-03 integration: replace flow keeps slot-compatible meal first, then fallback', () => {
  let state = {
    weekMeals: structuredClone(weekMealsFixture),
    selectedDay: 'Mon',
    approvedIds: [],
    replaceCursorByDay: { Mon: 0 },
    replacementPool: replacementPoolFixture,
  };

  const first = replaceTopCard(state);
  assert.equal(first.weekMeals.Mon[0].id, 'mon-r1');
  assert.equal(first.weekMeals.Mon[0].level, 'Beginner');
  assert.equal(first.replaceCursorByDay.Mon, 1);

  state = { ...state, ...first };
  const second = replaceTopCard(state);
  assert.equal(second.weekMeals.Mon[0].id, 'mon-r2');
  assert.equal(second.replaceCursorByDay.Mon, 2);
});

test('T-TST-04 integration: consolidated list totals merge duplicate name+unit+category', () => {
  const grouped = consolidateIngredients(weekMealsFixture);

  const rice = grouped.Pantry.find((item) => item.name === 'Rice');
  const chicken = grouped.Protein.find((item) => item.name === 'Chicken breast');

  assert.ok(rice);
  assert.ok(chicken);
  assert.equal(rice.amount, 300);
  assert.equal(chicken.amount, 500);
  assert.equal(grouped.Pantry.filter((item) => item.name === 'Rice').length, 1);
});
