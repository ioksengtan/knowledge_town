import type { BuildingCategory } from './types';

// Placeholder-art palette: 5 body colors per category (dull -> saturated),
// plus a gold trim that intensifies with stage. This stands in for the real
// pixel-art asset set described in docs/art-spec.md.
export const CATEGORY_BODY: Record<BuildingCategory, [string, string, string, string, string]> = {
  production: ['#3f3c30', '#565033', '#75672f', '#9c8434', '#c9a23c'],
  training: ['#2f3f45', '#33555f', '#2f6f7a', '#3f8f97', '#63b6bd'],
  hero: ['#452f2f', '#5f3333', '#7a2f2f', '#973939', '#b84545'],
  rnd: ['#332f45', '#3f335f', '#4a2f7a', '#5f3f97', '#7a4fb8'],
};

export const CATEGORY_ICON: Record<BuildingCategory, string> = {
  production: '⚙️',
  training: '🎯',
  hero: '🎖️',
  rnd: '🔬',
};

export const TRIM_OPACITY = [0.1, 0.25, 0.4, 0.6, 0.85];

export function bodyColor(category: BuildingCategory, stage: number): string {
  const idx = Math.min(4, Math.max(0, stage - 1));
  return CATEGORY_BODY[category][idx];
}

export function trimOpacity(stage: number): number {
  const idx = Math.min(4, Math.max(0, stage - 1));
  return TRIM_OPACITY[idx];
}
