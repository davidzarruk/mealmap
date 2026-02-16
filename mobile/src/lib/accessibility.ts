/**
 * F8-009: Accessibility audit utilities
 *
 * Provides helpers for VoiceOver, contrast checking, font scaling,
 * and reduced motion support.
 */

import { AccessibilityInfo, PixelRatio, Platform, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';

// ─── Contrast ratio checker (WCAG 2.1) ───

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG_AA(fg: string, bg: string, isLargeText = false): boolean {
  const ratio = contrastRatio(fg, bg);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

export function meetsWCAG_AAA(fg: string, bg: string, isLargeText = false): boolean {
  const ratio = contrastRatio(fg, bg);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// ─── Font scaling ───

export function scaledFontSize(baseFontSize: number): number {
  const fontScale = PixelRatio.getFontScale();
  // Cap at 1.5x to avoid layout breakage
  const clampedScale = Math.min(fontScale, 1.5);
  return Math.round(baseFontSize * clampedScale);
}

export function useScaledFont(baseFontSize: number): number {
  return scaledFontSize(baseFontSize);
}

// ─── Reduced motion ───

export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    // Listen for changes
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  return reduceMotion;
}

// ─── Screen reader detection ───

export function useScreenReader(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setActive);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setActive);
    return () => sub.remove();
  }, []);

  return active;
}

// ─── Accessibility announcements ───

export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

// ─── VoiceOver label builders ───

export function mealCardLabel(title: string, prepTimeMin: number, level: string, isApproved: boolean, isFavorite: boolean): string {
  const parts = [title, `${prepTimeMin} minutes`, level];
  if (isApproved) parts.push('approved');
  if (isFavorite) parts.push('favorite');
  return parts.join(', ');
}

export function shoppingItemLabel(name: string, amount: number, unit: string, checked: boolean): string {
  return `${name}, ${amount} ${unit}${checked ? ', purchased' : ''}`;
}

export function progressLabel(approved: number, total: number, percent: number): string {
  return `Weekly progress: ${percent} percent, ${approved} of ${total} meals approved`;
}

// ─── Theme audit (development tool) ───

export type ContrastAuditResult = {
  pair: string;
  fg: string;
  bg: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
};

export function auditThemeContrast(colors: Record<string, string>): ContrastAuditResult[] {
  const bg = colors.background;
  const surface = colors.surface;
  const results: ContrastAuditResult[] = [];

  const textColors = ['text', 'muted', 'primary', 'success', 'danger'];

  for (const name of textColors) {
    if (!colors[name]) continue;

    // Against background
    results.push({
      pair: `${name} on background`,
      fg: colors[name],
      bg,
      ratio: Math.round(contrastRatio(colors[name], bg) * 100) / 100,
      passesAA: meetsWCAG_AA(colors[name], bg),
      passesAAA: meetsWCAG_AAA(colors[name], bg),
    });

    // Against surface
    results.push({
      pair: `${name} on surface`,
      fg: colors[name],
      bg: surface,
      ratio: Math.round(contrastRatio(colors[name], surface) * 100) / 100,
      passesAA: meetsWCAG_AA(colors[name], surface),
      passesAAA: meetsWCAG_AAA(colors[name], surface),
    });
  }

  return results;
}
