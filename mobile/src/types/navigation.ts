import { IngredientItem, SkillLevel } from '../data/plan';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Plan: undefined;
  Shopping: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  Setup: undefined;
  PlanHistory: undefined;
  MealDetails: {
    slotId: string;
    title: string;
    prepTimeMin: number;
    level: SkillLevel;
    ingredients: IngredientItem[];
    shortPrep: string;
  };
  MealPrep: {
    weekMealsJson: string;
    approvedIds: string[];
  };
  MealCalendar: undefined;
  Favorites: undefined;
  CustomMeal: undefined;
  CookingTimer: { stepIndex: number; durationMin: number; stepLabel: string };
  LeftoverTracker: undefined;
};
