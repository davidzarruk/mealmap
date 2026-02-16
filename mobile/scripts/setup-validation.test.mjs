import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSetupInput } from '../src/domain/setupValidation.mjs';

test('accepts valid defaults (lunch enabled by default)', () => {
  const result = validateSetupInput({
    people: '2',
    includeBreakfast: false,
    includeLunch: true,
    includeDinner: false,
    maxPrepMinutes: '45',
    cookingLevel: 'beginner',
    region: 'colombia',
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.normalized, {
    people: 2,
    maxPrepMinutes: 45,
    mealTypes: ['lunch'],
    cookingLevel: 'beginner',
    region: 'colombia',
  });
});

test('rejects when no meal type is selected', () => {
  const result = validateSetupInput({
    people: '2',
    includeBreakfast: false,
    includeLunch: false,
    includeDinner: false,
    maxPrepMinutes: '45',
    cookingLevel: 'beginner',
    region: 'colombia',
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('at least one meal type must be selected'));
});

test('rejects out-of-range people and invalid prep time', () => {
  const result = validateSetupInput({
    people: '9',
    includeBreakfast: false,
    includeLunch: true,
    includeDinner: false,
    maxPrepMinutes: '10',
    cookingLevel: 'beginner',
    region: 'colombia',
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('people must be an integer between 1 and 6'));
  assert.ok(result.errors.includes('maxPrepMinutes must be one of: 15, 30, 45, 60'));
});
