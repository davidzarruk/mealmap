export function getPendingCards(weekMeals, selectedDay, approvedIds) {
  const dayCards = weekMeals[selectedDay] ?? [];
  return dayCards.filter((card) => !approvedIds.includes(card.id));
}

export function approveTopCard({ weekMeals, selectedDay, approvedIds }) {
  const pendingCards = getPendingCards(weekMeals, selectedDay, approvedIds);
  const topCard = pendingCards[0];
  if (!topCard) return approvedIds;
  return approvedIds.includes(topCard.id) ? approvedIds : [...approvedIds, topCard.id];
}

function replacementScore(topCard, candidate) {
  let score = 0;

  if (candidate.level === topCard.level) score += 4;

  const prepDelta = Math.abs((candidate.prepTimeMin ?? 0) - (topCard.prepTimeMin ?? 0));
  if (prepDelta <= 10) score += 3;
  else if (prepDelta <= 20) score += 1;

  const topIngredients = new Set((topCard.ingredients ?? []).map((i) => i.category));
  const overlap = (candidate.ingredients ?? []).filter((i) => topIngredients.has(i.category)).length;
  score += Math.min(3, overlap);

  return score;
}

export function replaceTopCard({ weekMeals, selectedDay, approvedIds, replaceCursorByDay, replacementPool }) {
  const pendingCards = getPendingCards(weekMeals, selectedDay, approvedIds);
  const topCard = pendingCards[0];
  if (!topCard) {
    return { weekMeals, approvedIds, replaceCursorByDay, replacement: null };
  }

  const dayPool = replacementPool[selectedDay] ?? [];
  if (dayPool.length === 0) {
    return { weekMeals, approvedIds, replaceCursorByDay, replacement: null };
  }

  const cursor = replaceCursorByDay[selectedDay] ?? 0;
  const preferred = dayPool[cursor % dayPool.length];

  const dayCardsNow = weekMeals[selectedDay] ?? [];
  const usedIds = new Set(dayCardsNow.map((m) => m.id));

  const ranked = dayPool
    .filter((candidate) => !usedIds.has(candidate.id))
    .map((candidate) => ({
      candidate,
      score: replacementScore(topCard, candidate),
    }))
    .sort((a, b) => b.score - a.score);

  const replacement = ranked[0]?.candidate ?? preferred;

  const updatedWeekMeals = {
    ...weekMeals,
    [selectedDay]: dayCardsNow.map((card) => (card.id === topCard.id ? replacement : card)),
  };

  const updatedApprovedIds = approvedIds.filter((id) => id !== topCard.id);
  const updatedCursor = {
    ...replaceCursorByDay,
    [selectedDay]: cursor + 1,
  };

  return {
    weekMeals: updatedWeekMeals,
    approvedIds: updatedApprovedIds,
    replaceCursorByDay: updatedCursor,
    replacement,
  };
}

export function consolidateIngredients(weekMeals) {
  const bucket = new Map();

  Object.values(weekMeals)
    .flat()
    .forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const key = `${ingredient.category}-${ingredient.name}-${ingredient.unit}`.toLowerCase();
        const prev = bucket.get(key);
        if (!prev) {
          bucket.set(key, { ...ingredient });
          return;
        }
        bucket.set(key, { ...prev, amount: prev.amount + ingredient.amount });
      });
    });

  const grouped = { Produce: [], Protein: [], Pantry: [], Dairy: [] };
  [...bucket.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => grouped[item.category].push(item));

  return grouped;
}
