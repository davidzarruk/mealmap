export function validateSetupInput(input) {
  const errors = [];

  const people = Number(input.people);
  if (!Number.isInteger(people) || people < 1 || people > 6) {
    errors.push('people must be an integer between 1 and 6');
  }

  const maxPrepMinutes = Number(input.maxPrepMinutes);
  const allowedMaxTimes = new Set([15, 30, 45, 60]);
  if (!Number.isInteger(maxPrepMinutes) || !allowedMaxTimes.has(maxPrepMinutes)) {
    errors.push('maxPrepMinutes must be one of: 15, 30, 45, 60');
  }

  const mealTypes = [
    input.includeBreakfast ? 'breakfast' : null,
    input.includeLunch ? 'lunch' : null,
    input.includeDinner ? 'dinner' : null,
  ].filter(Boolean);

  if (mealTypes.length === 0) {
    errors.push('at least one meal type must be selected');
  }

  const allowedLevels = new Set(['beginner', 'intermediate', 'advanced']);
  if (!allowedLevels.has(input.cookingLevel)) {
    errors.push('cookingLevel must be beginner, intermediate, or advanced');
  }

  const allowedRegions = new Set(['colombia', 'international']);
  if (!allowedRegions.has(input.region)) {
    errors.push('region must be colombia or international');
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized: errors.length
      ? null
      : {
          people,
          maxPrepMinutes,
          mealTypes,
          cookingLevel: input.cookingLevel,
          region: input.region,
        },
  };
}
