// Auto-generated descriptions for existing meals
// IT-007: Add meal description to swipe cards

const descriptions: Record<string, string> = {
  'mon-1': 'Traditional Colombian potato soup with chicken, corn and cream — hearty and comforting.',
  'mon-2': 'Seasoned chicken over rice with fresh avocado and creole hogao sauce.',
  'mon-3': 'Protein-rich lentils cooked with aromatic sofrito, served alongside fluffy rice.',
  'tue-1': 'Tender beef chunks slow-simmered with potatoes in a rich tomato broth.',
  'tue-2': 'Light and fresh salad with warm tuna, sweet corn and zesty lemon dressing.',
  'tue-3': 'Crispy tortillas stuffed with seasoned mashed beans and melted cheese.',
  'wed-1': 'Oven-baked tilapia finished with fresh lemon juice and roasted garlic.',
  'wed-2': 'Simple stir-fried rice with colorful mixed vegetables and savory soy sauce.',
  'wed-3': 'Classic Italian pasta in smooth tomato sauce with aromatic fresh basil.',
  'thu-1': 'Rich Colombian broth with chicken, plantain and yuca — a Sunday classic made express.',
  'thu-2': 'Quick and light turkey wraps with crisp lettuce — perfect for busy days.',
  'thu-3': 'Creamy mild curry with tender chickpeas in coconut milk, warmly spiced.',
  'fri-1': 'Wok-tossed rice with scrambled egg, diced chicken and a splash of soy sauce.',
  'fri-2': 'Velvety pumpkin soup blended with milk and caramelized onion.',
  'fri-3': 'Juicy grilled chicken patties on toasted buns with fresh tomato slices.',
  'sat-1': 'Festive rice cooked with bell peppers and peas in a saffron-style broth.',
  'sat-2': 'Fluffy eggs folded with sautéed spinach and melted cheese — quick brunch.',
  'sat-3': 'Golden corn arepas stuffed with melted cheese and creamy avocado.',
  'sun-1': 'Herb-roasted chicken thighs with crispy potatoes and fragrant rosemary.',
  'sun-2': 'Light and nourishing vegetable soup with carrot, potato and celery.',
  'sun-3': 'Layered rice, beans and corn bowl topped with fresh salsa — easy and filling.',
  'mon-r1': 'Comfort stew with tender chicken pieces and soft potato in savory broth.',
  'mon-r2': 'Oven-baked chickpeas in tangy tomato sauce served over fluffy rice.',
  'tue-r1': 'Pan-seared steak with sweet caramelized onions and a rich pan sauce.',
  'tue-r2': 'Quick wraps filled with tuna and sweet corn — great for lunch on the go.',
  'wed-r1': 'Juicy chicken breast topped with fresh Colombian criolla sauce.',
  'wed-r2': 'Fluffy quinoa tossed with sautéed mixed vegetables and a squeeze of lemon.',
  'thu-r1': 'Creamy rice loaded with mixed seafood and sweet bell pepper.',
  'thu-r2': 'Quick stir-fry of chicken and broccoli in a savory soy-based glaze.',
  'fri-r1': 'Homemade beef meatballs simmered in garlicky tomato sauce.',
  'fri-r2': 'Smooth and creamy carrot soup blended with milk and sweet onion.',
  'sat-r1': 'Golden oven-baked rice with chicken thighs and roasted bell pepper.',
  'sat-r2': 'Classic Colombian scrambled eggs with tomato and onion, served with arepas.',
  'sun-r1': 'Shredded beef in vibrant criolla sauce — slow-cooked and full of flavor.',
  'sun-r2': 'Chilled pasta salad with tuna and sweet corn — refreshing and easy.',
};

export function getMealDescription(id: string): string {
  // Strip any dynamic suffixes for LLM-generated meals
  const baseId = id.replace(/-\d+-\d+$/, '');
  return descriptions[baseId] ?? descriptions[id] ?? '';
}
