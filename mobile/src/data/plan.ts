export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type IngredientItem = {
  name: string;
  amount: number;
  unit: string;
  category: 'Produce' | 'Protein' | 'Pantry' | 'Dairy';
};

export type MealCard = {
  id: string;
  title: string;
  prepTimeMin: number;
  level: SkillLevel;
  ingredients: IngredientItem[];
  shortPrep: string;
};

export type WeekMealsMap = Record<DayKey, MealCard[]>;

const ing = (
  name: string,
  amount: number,
  unit: string,
  category: IngredientItem['category'],
): IngredientItem => ({ name, amount, unit, category });

export const dayTabs: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const initialWeekMeals: WeekMealsMap = {
  Mon: [
    {
      id: 'mon-1',
      title: 'Quick ajiaco',
      prepTimeMin: 35,
      level: 'Beginner',
      ingredients: [ing('Potato', 600, 'g', 'Produce'), ing('Chicken breast', 400, 'g', 'Protein'), ing('Corn', 2, 'unit', 'Produce')],
      shortPrep: 'Boil potatoes and corn, add chicken, simmer with guasca and finish with cream.',
    },
    {
      id: 'mon-2',
      title: 'Creole chicken bowl',
      prepTimeMin: 30,
      level: 'Beginner',
      ingredients: [ing('Rice', 300, 'g', 'Pantry'), ing('Chicken breast', 350, 'g', 'Protein'), ing('Avocado', 1, 'unit', 'Produce')],
      shortPrep: 'Cook rice, pan-sear chicken with hogao, serve with sliced avocado.',
    },
    {
      id: 'mon-3',
      title: 'Lentils with rice',
      prepTimeMin: 40,
      level: 'Intermediate',
      ingredients: [ing('Lentils', 300, 'g', 'Pantry'), ing('Rice', 250, 'g', 'Pantry'), ing('Carrot', 1, 'unit', 'Produce')],
      shortPrep: 'Cook lentils with sofrito, prepare rice separately, combine for serving.',
    },
  ],
  Tue: [
    {
      id: 'tue-1',
      title: 'Beef stew',
      prepTimeMin: 45,
      level: 'Intermediate',
      ingredients: [ing('Beef', 450, 'g', 'Protein'), ing('Potato', 500, 'g', 'Produce'), ing('Tomato', 2, 'unit', 'Produce')],
      shortPrep: 'Brown beef, add potato and tomato base, cover and simmer until tender.',
    },
    {
      id: 'tue-2',
      title: 'Warm tuna salad',
      prepTimeMin: 20,
      level: 'Beginner',
      ingredients: [ing('Tuna', 2, 'can', 'Protein'), ing('Lettuce', 1, 'unit', 'Produce'), ing('Sweet corn', 150, 'g', 'Produce')],
      shortPrep: 'Warm tuna with corn, toss with lettuce and lemon dressing.',
    },
    {
      id: 'tue-3',
      title: 'Bean tacos',
      prepTimeMin: 25,
      level: 'Beginner',
      ingredients: [ing('Beans', 300, 'g', 'Pantry'), ing('Tortillas', 8, 'unit', 'Pantry'), ing('Cheese', 120, 'g', 'Dairy')],
      shortPrep: 'Mash warm beans, fill tortillas, top with cheese and toast lightly.',
    },
  ],
  Wed: [
    {
      id: 'wed-1',
      title: 'Baked tilapia',
      prepTimeMin: 30,
      level: 'Beginner',
      ingredients: [ing('Tilapia fillet', 450, 'g', 'Protein'), ing('Lemon', 2, 'unit', 'Produce'), ing('Garlic', 3, 'clove', 'Produce')],
      shortPrep: 'Season fish, bake 18 minutes, finish with lemon and parsley.',
    },
    {
      id: 'wed-2',
      title: 'Vegetable rice',
      prepTimeMin: 28,
      level: 'Beginner',
      ingredients: [ing('Rice', 320, 'g', 'Pantry'), ing('Mixed vegetables', 300, 'g', 'Produce'), ing('Soy sauce', 30, 'ml', 'Pantry')],
      shortPrep: 'Cook rice and stir-fry vegetables; combine with soy sauce.',
    },
    {
      id: 'wed-3',
      title: 'Tomato basil pasta',
      prepTimeMin: 22,
      level: 'Beginner',
      ingredients: [ing('Pasta', 350, 'g', 'Pantry'), ing('Tomato sauce', 300, 'ml', 'Pantry'), ing('Basil', 10, 'g', 'Produce')],
      shortPrep: 'Boil pasta, simmer tomato sauce, fold with basil and serve hot.',
    },
  ],
  Thu: [
    {
      id: 'thu-1',
      title: 'Express sancocho',
      prepTimeMin: 50,
      level: 'Advanced',
      ingredients: [ing('Chicken thigh', 500, 'g', 'Protein'), ing('Plantain', 1, 'unit', 'Produce'), ing('Yuca', 400, 'g', 'Produce')],
      shortPrep: 'Build broth with chicken, add roots and plantain, simmer until rich.',
    },
    {
      id: 'thu-2',
      title: 'Turkey wrap',
      prepTimeMin: 18,
      level: 'Beginner',
      ingredients: [ing('Turkey slices', 220, 'g', 'Protein'), ing('Tortilla wrap', 4, 'unit', 'Pantry'), ing('Lettuce', 1, 'unit', 'Produce')],
      shortPrep: 'Warm wraps, fill with turkey and lettuce, roll tightly.',
    },
    {
      id: 'thu-3',
      title: 'Mild chickpea curry',
      prepTimeMin: 35,
      level: 'Intermediate',
      ingredients: [ing('Chickpeas', 350, 'g', 'Pantry'), ing('Coconut milk', 250, 'ml', 'Pantry'), ing('Onion', 1, 'unit', 'Produce')],
      shortPrep: 'Cook onion and spices, add chickpeas and coconut milk, simmer.',
    },
  ],
  Fri: [
    {
      id: 'fri-1',
      title: 'Homemade fried rice',
      prepTimeMin: 30,
      level: 'Intermediate',
      ingredients: [ing('Rice', 320, 'g', 'Pantry'), ing('Egg', 3, 'unit', 'Protein'), ing('Chicken breast', 300, 'g', 'Protein')],
      shortPrep: 'Stir-fry cooked rice with egg, chicken and soy sauce on high heat.',
    },
    {
      id: 'fri-2',
      title: 'Pumpkin cream soup',
      prepTimeMin: 25,
      level: 'Beginner',
      ingredients: [ing('Pumpkin', 700, 'g', 'Produce'), ing('Milk', 250, 'ml', 'Dairy'), ing('Onion', 1, 'unit', 'Produce')],
      shortPrep: 'Boil pumpkin and onion, blend with milk, season and serve.',
    },
    {
      id: 'fri-3',
      title: 'Chicken burger',
      prepTimeMin: 35,
      level: 'Intermediate',
      ingredients: [ing('Ground chicken', 450, 'g', 'Protein'), ing('Burger buns', 4, 'unit', 'Pantry'), ing('Tomato', 2, 'unit', 'Produce')],
      shortPrep: 'Form patties, grill until cooked, assemble burgers with tomato.',
    },
  ],
  Sat: [
    {
      id: 'sat-1',
      title: 'Vegetable paella',
      prepTimeMin: 55,
      level: 'Advanced',
      ingredients: [ing('Rice', 350, 'g', 'Pantry'), ing('Bell pepper', 2, 'unit', 'Produce'), ing('Peas', 150, 'g', 'Produce')],
      shortPrep: 'Toast rice with sofrito, add stock and vegetables, cook uncovered.',
    },
    {
      id: 'sat-2',
      title: 'Vegetable omelette',
      prepTimeMin: 15,
      level: 'Beginner',
      ingredients: [ing('Egg', 4, 'unit', 'Protein'), ing('Spinach', 120, 'g', 'Produce'), ing('Cheese', 80, 'g', 'Dairy')],
      shortPrep: 'Whisk eggs, add sautéed vegetables, fold with cheese.',
    },
    {
      id: 'sat-3',
      title: 'Stuffed arepas',
      prepTimeMin: 32,
      level: 'Intermediate',
      ingredients: [ing('Pre-cooked corn flour', 300, 'g', 'Pantry'), ing('Cheese', 150, 'g', 'Dairy'), ing('Avocado', 1, 'unit', 'Produce')],
      shortPrep: 'Prepare arepa dough, griddle both sides, fill with cheese and avocado.',
    },
  ],
  Sun: [
    {
      id: 'sun-1',
      title: 'Roasted chicken',
      prepTimeMin: 50,
      level: 'Intermediate',
      ingredients: [ing('Chicken thigh', 600, 'g', 'Protein'), ing('Potato', 500, 'g', 'Produce'), ing('Rosemary', 8, 'g', 'Produce')],
      shortPrep: 'Season chicken and potato, roast until golden and juicy.',
    },
    {
      id: 'sun-2',
      title: 'Vegetable soup',
      prepTimeMin: 26,
      level: 'Beginner',
      ingredients: [ing('Carrot', 2, 'unit', 'Produce'), ing('Potato', 300, 'g', 'Produce'), ing('Celery', 120, 'g', 'Produce')],
      shortPrep: 'Simmer chopped vegetables in broth until tender.',
    },
    {
      id: 'sun-3',
      title: 'Burrito bowl',
      prepTimeMin: 24,
      level: 'Beginner',
      ingredients: [ing('Rice', 300, 'g', 'Pantry'), ing('Beans', 280, 'g', 'Pantry'), ing('Corn', 180, 'g', 'Produce')],
      shortPrep: 'Layer rice, beans and corn with salsa for quick bowls.',
    },
  ],
};

export const replacementPool: WeekMealsMap = {
  Mon: [
    { id: 'mon-r1', title: 'Stewed chicken with potato', prepTimeMin: 38, level: 'Beginner', ingredients: [ing('Chicken breast', 400, 'g', 'Protein'), ing('Potato', 450, 'g', 'Produce'), ing('Onion', 1, 'unit', 'Produce')], shortPrep: 'Brown chicken, stew with potato and onion until soft.' },
    { id: 'mon-r2', title: 'Chickpea tray bake', prepTimeMin: 36, level: 'Intermediate', ingredients: [ing('Chickpeas', 360, 'g', 'Pantry'), ing('Tomato', 2, 'unit', 'Produce'), ing('Rice', 220, 'g', 'Pantry')], shortPrep: 'Stew chickpeas in tomato base and serve over rice.' },
  ],
  Tue: [
    { id: 'tue-r1', title: 'Steak with onions', prepTimeMin: 42, level: 'Intermediate', ingredients: [ing('Beef', 420, 'g', 'Protein'), ing('Onion', 2, 'unit', 'Produce'), ing('Rice', 250, 'g', 'Pantry')], shortPrep: 'Sear beef, cook onions until sweet, finish with pan sauce.' },
    { id: 'tue-r2', title: 'Tuna and corn wrap', prepTimeMin: 22, level: 'Beginner', ingredients: [ing('Tuna', 2, 'can', 'Protein'), ing('Tortilla wrap', 4, 'unit', 'Pantry'), ing('Sweet corn', 160, 'g', 'Produce')], shortPrep: 'Mix tuna with corn and fill wraps.' },
  ],
  Wed: [
    { id: 'wed-r1', title: 'Chicken breast in creole sauce', prepTimeMin: 30, level: 'Beginner', ingredients: [ing('Chicken breast', 420, 'g', 'Protein'), ing('Tomato', 2, 'unit', 'Produce'), ing('Onion', 1, 'unit', 'Produce')], shortPrep: 'Cook chicken and finish in fresh criolla sauce.' },
    { id: 'wed-r2', title: 'Quinoa with vegetables', prepTimeMin: 27, level: 'Beginner', ingredients: [ing('Quinoa', 260, 'g', 'Pantry'), ing('Mixed vegetables', 280, 'g', 'Produce'), ing('Lemon', 1, 'unit', 'Produce')], shortPrep: 'Simmer quinoa and fold in sautéed vegetables.' },
  ],
  Thu: [
    { id: 'thu-r1', title: 'Creamy seafood rice', prepTimeMin: 52, level: 'Advanced', ingredients: [ing('Rice', 340, 'g', 'Pantry'), ing('Seafood mix', 420, 'g', 'Protein'), ing('Bell pepper', 1, 'unit', 'Produce')], shortPrep: 'Cook sofrito, add seafood and rice with warm stock.' },
    { id: 'thu-r2', title: 'Chicken and broccoli stir-fry', prepTimeMin: 33, level: 'Intermediate', ingredients: [ing('Chicken breast', 380, 'g', 'Protein'), ing('Broccoli', 300, 'g', 'Produce'), ing('Soy sauce', 30, 'ml', 'Pantry')], shortPrep: 'Stir-fry chicken and broccoli in soy-based sauce.' },
  ],
  Fri: [
    { id: 'fri-r1', title: 'Meatballs in sauce', prepTimeMin: 34, level: 'Intermediate', ingredients: [ing('Ground beef', 420, 'g', 'Protein'), ing('Tomato sauce', 280, 'ml', 'Pantry'), ing('Garlic', 3, 'clove', 'Produce')], shortPrep: 'Brown meatballs and simmer in tomato sauce.' },
    { id: 'fri-r2', title: 'Carrot cream soup', prepTimeMin: 24, level: 'Beginner', ingredients: [ing('Carrot', 500, 'g', 'Produce'), ing('Milk', 220, 'ml', 'Dairy'), ing('Onion', 1, 'unit', 'Produce')], shortPrep: 'Cook carrots and onion, blend smooth with milk.' },
  ],
  Sat: [
    { id: 'sat-r1', title: 'Valencian baked rice', prepTimeMin: 58, level: 'Advanced', ingredients: [ing('Rice', 350, 'g', 'Pantry'), ing('Chicken thigh', 420, 'g', 'Protein'), ing('Bell pepper', 1, 'unit', 'Produce')], shortPrep: 'Par-cook rice, combine with toppings, finish in oven.' },
    { id: 'sat-r2', title: 'Perico eggs with arepa', prepTimeMin: 16, level: 'Beginner', ingredients: [ing('Egg', 4, 'unit', 'Protein'), ing('Tomato', 1, 'unit', 'Produce'), ing('Arepa', 4, 'unit', 'Pantry')], shortPrep: 'Scramble eggs with tomato and onion, serve with arepas.' },
  ],
  Sun: [
    { id: 'sun-r1', title: 'Creole shredded beef', prepTimeMin: 48, level: 'Intermediate', ingredients: [ing('Beef', 500, 'g', 'Protein'), ing('Tomato', 2, 'unit', 'Produce'), ing('Onion', 1, 'unit', 'Produce')], shortPrep: 'Pressure-cook beef, shred, and finish in criolla sauce.' },
    { id: 'sun-r2', title: 'Cold pasta salad', prepTimeMin: 25, level: 'Beginner', ingredients: [ing('Pasta', 300, 'g', 'Pantry'), ing('Tuna', 1, 'can', 'Protein'), ing('Corn', 120, 'g', 'Produce')], shortPrep: 'Cook pasta, chill, and toss with tuna and corn.' },
  ],
};
