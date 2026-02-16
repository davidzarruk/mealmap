/**
 * F8-003: Internationalization (i18n)
 *
 * Simple translation system with English and Spanish support.
 * Uses a hook for reactive language switching.
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// ─── Types ───

export type SupportedLocale = 'en' | 'es';

export type TranslationKey = keyof typeof en;

// ─── Translations ───

const en = {
  // Common
  'common.save': 'Save changes',
  'common.saved': '✓ Saved',
  'common.cancel': 'Cancel',
  'common.reset': 'Reset',
  'common.loading': 'Loading…',
  'common.error': 'Error',
  'common.retry': 'Retry',
  'common.copy': '📋 Copy',
  'common.share': '📤 Share',
  'common.search': '🔍 Search meals…',

  // Auth
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.signOut': 'Sign out',
  'auth.signOutAll': 'Sign out on all devices',
  'auth.signOutConfirm': 'Are you sure you want to sign out on all devices?',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.noAccount': "Don't have an account?",
  'auth.haveAccount': 'Already have an account?',

  // Plan
  'plan.title': 'This week',
  'plan.subtitle': 'Swipe right to approve or left to replace meals.',
  'plan.weeklyProgress': 'Weekly progress',
  'plan.mealsApproved': '{approved} of {total} meals approved',
  'plan.dayProgress': '{day}: {approved}/{total} approved',
  'plan.portions': 'Portions:',
  'plan.swipeHint': '← Replace · Approve →',
  'plan.doneForDay': "You're done for {day}",
  'plan.switchDay': 'Switch to another day to keep planning your week.',
  'plan.weekComplete': 'Week complete!',
  'plan.weekCompleteSub': 'All meals approved. Your shopping list is ready!',
  'plan.history': '📅 Plan history',
  'plan.adjustPrefs': 'Adjust preferences',
  'plan.favorites': 'Favorites',
  'plan.dietFilter': '🏷️ Diet',
  'plan.noFavorites': 'No favorite meals pending',
  'plan.noDietMatch': 'No meals match dietary filters',

  // Swipe tutorial
  'swipe.title': 'How swipes work',
  'swipe.description': 'Swipe right to approve a meal, swipe left to replace it with a similar option.',
  'swipe.gotIt': 'Got it',

  // Shopping
  'shopping.title': 'Shopping list',
  'shopping.subtitle': 'Consolidated ingredients grouped by category.',
  'shopping.empty': 'No ingredients yet',
  'shopping.emptyHint': 'Approve at least one meal to generate your shopping list.',
  'shopping.resetEdits': 'Reset edits',

  // Profile
  'profile.title': 'Profile & Settings',
  'profile.subtitle': 'Manage your account and preferences.',
  'profile.displayName': 'Display name',
  'profile.foodPrefs': 'Food preferences / allergies',
  'profile.foodPrefsPlaceholder': 'e.g. No seafood, lactose intolerant',
  'profile.dailyReminder': 'Daily reminder',
  'profile.enableNotif': 'Enable daily notification',
  'profile.account': 'Account',
  'profile.language': 'Language',

  // Meal details
  'meal.minutes': 'minutes',
  'meal.servings': 'servings',
  'meal.difficulty': 'difficulty',
  'meal.ingredients': 'Ingredients',
  'meal.preparation': 'Preparation',
  'meal.photoSoon': 'Photo coming soon',

  // Analytics
  'analytics.title': 'Analytics',

  // Setup
  'setup.title': 'Plan setup',

  // Errors
  'error.permissionRequired': 'Permission required',
  'error.enableNotifications': 'Enable notifications in your device settings to use reminders.',
} as const;

const es: Record<TranslationKey, string> = {
  'common.save': 'Guardar cambios',
  'common.saved': '✓ Guardado',
  'common.cancel': 'Cancelar',
  'common.reset': 'Reiniciar',
  'common.loading': 'Cargando…',
  'common.error': 'Error',
  'common.retry': 'Reintentar',
  'common.copy': '📋 Copiar',
  'common.share': '📤 Compartir',
  'common.search': '🔍 Buscar comidas…',

  'auth.signIn': 'Iniciar sesión',
  'auth.signUp': 'Registrarse',
  'auth.signOut': 'Cerrar sesión',
  'auth.signOutAll': 'Cerrar sesión en todos los dispositivos',
  'auth.signOutConfirm': '¿Estás seguro de que quieres cerrar sesión en todos los dispositivos?',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.noAccount': '¿No tienes cuenta?',
  'auth.haveAccount': '¿Ya tienes cuenta?',

  'plan.title': 'Esta semana',
  'plan.subtitle': 'Desliza a la derecha para aprobar o a la izquierda para reemplazar.',
  'plan.weeklyProgress': 'Progreso semanal',
  'plan.mealsApproved': '{approved} de {total} comidas aprobadas',
  'plan.dayProgress': '{day}: {approved}/{total} aprobadas',
  'plan.portions': 'Porciones:',
  'plan.swipeHint': '← Reemplazar · Aprobar →',
  'plan.doneForDay': 'Terminaste con {day}',
  'plan.switchDay': 'Cambia a otro día para seguir planeando tu semana.',
  'plan.weekComplete': '¡Semana completa!',
  'plan.weekCompleteSub': 'Todas las comidas aprobadas. ¡Tu lista de compras está lista!',
  'plan.history': '📅 Historial de planes',
  'plan.adjustPrefs': 'Ajustar preferencias',
  'plan.favorites': 'Favoritos',
  'plan.dietFilter': '🏷️ Dieta',
  'plan.noFavorites': 'No hay comidas favoritas pendientes',
  'plan.noDietMatch': 'No hay comidas que coincidan con los filtros',

  'swipe.title': 'Cómo funcionan los deslizamientos',
  'swipe.description': 'Desliza a la derecha para aprobar, a la izquierda para reemplazar con una opción similar.',
  'swipe.gotIt': 'Entendido',

  'shopping.title': 'Lista de compras',
  'shopping.subtitle': 'Ingredientes consolidados agrupados por categoría.',
  'shopping.empty': 'Sin ingredientes aún',
  'shopping.emptyHint': 'Aprueba al menos una comida para generar tu lista de compras.',
  'shopping.resetEdits': 'Reiniciar ediciones',

  'profile.title': 'Perfil y Ajustes',
  'profile.subtitle': 'Administra tu cuenta y preferencias.',
  'profile.displayName': 'Nombre',
  'profile.foodPrefs': 'Preferencias alimentarias / alergias',
  'profile.foodPrefsPlaceholder': 'Ej. Sin mariscos, intolerante a la lactosa',
  'profile.dailyReminder': 'Recordatorio diario',
  'profile.enableNotif': 'Activar notificación diaria',
  'profile.account': 'Cuenta',
  'profile.language': 'Idioma',

  'meal.minutes': 'minutos',
  'meal.servings': 'porciones',
  'meal.difficulty': 'dificultad',
  'meal.ingredients': 'Ingredientes',
  'meal.preparation': 'Preparación',
  'meal.photoSoon': 'Foto próximamente',

  'analytics.title': 'Estadísticas',

  'setup.title': 'Configuración del plan',

  'error.permissionRequired': 'Permiso requerido',
  'error.enableNotifications': 'Activa las notificaciones en los ajustes de tu dispositivo para usar recordatorios.',
};

// ─── Translation maps ───

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = { en, es };

// ─── State ───

const LOCALE_KEY = 'mealmap/locale';
let _currentLocale: SupportedLocale = 'en';
const _listeners = new Set<(locale: SupportedLocale) => void>();

function detectDeviceLocale(): SupportedLocale {
  try {
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ??
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (typeof deviceLocale === 'string' && deviceLocale.startsWith('es')) return 'es';
  } catch {
    // ignore
  }
  return 'en';
}

// ─── Public API ───

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let text = translations[_currentLocale]?.[key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export function getCurrentLocale(): SupportedLocale {
  return _currentLocale;
}

export async function setLocale(locale: SupportedLocale): Promise<void> {
  _currentLocale = locale;
  await AsyncStorage.setItem(LOCALE_KEY, locale);
  _listeners.forEach((fn) => fn(locale));
}

export async function initLocale(): Promise<void> {
  const stored = await AsyncStorage.getItem(LOCALE_KEY);
  if (stored === 'en' || stored === 'es') {
    _currentLocale = stored;
  } else {
    _currentLocale = detectDeviceLocale();
  }
}

// ─── Hook ───

export function useTranslation() {
  const [locale, setLocaleState] = useState<SupportedLocale>(_currentLocale);

  useEffect(() => {
    const listener = (l: SupportedLocale) => setLocaleState(l);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => t(key, params),
    [locale],
  );

  const changeLocale = useCallback(async (l: SupportedLocale) => {
    await setLocale(l);
  }, []);

  return { t: translate, locale, setLocale: changeLocale };
}
