import type { BuildingCategory, QuizCard, ResourcePool, ResourceType } from './types';

/**
 * Numbers marked "待定案" in the spec (level cost curve beyond the old
 * 6-level table, land capacity/expansion costs, placement rule, course
 * reward curve, ...) are product decisions the spec explicitly leaves open.
 * The choices below are this implementation's defaults — see
 * docs/implementation-decisions.md for the full list and rationale so they
 * can be tuned without touching call sites.
 */

export const MAX_APPEARANCE_LEVEL = 15;
export const LEVELS_PER_STAGE = 3;
export const APPEARANCE_STAGES = 5;

export function appearanceStage(level: number): number {
  const capped = Math.min(level, MAX_APPEARANCE_LEVEL);
  return Math.min(APPEARANCE_STAGES, Math.ceil(capped / LEVELS_PER_STAGE) || 1);
}

// Cost to go from `level` to `level + 1`. Uncapped — the level number itself
// never stops climbing even though appearance freezes at level 15.
export function upgradeCost(level: number): number {
  return Math.round(5 * Math.pow(level + 1, 1.6));
}

export function totalCostToReach(level: number): number {
  let total = 0;
  for (let i = 0; i < level; i++) total += upgradeCost(i);
  return total;
}

export const INITIAL_LAND_CAPACITY = 6;
export const LAND_PER_EXPANSION = 4;

export function expansionCost(expansionsSoFar: number): number {
  return Math.round(50 * Math.pow(1.6, expansionsSoFar));
}

// Every upgrade/expansion cost is split roughly evenly across the three
// resources, regardless of which building is being upgraded. This is the
// implementation's answer to a question the spec doesn't address (v7.6
// doesn't say whether an upgrade costs its own building's resource or a
// mix) — a mixed cost means players need domains in all three categories
// to fund any single upgrade, which fits the "breadth of learning" theme
// better than a building that can fund itself in isolation.
const RESOURCE_TYPES: ResourceType[] = ['wood', 'ore', 'food'];

export function splitCost(total: number): ResourcePool {
  const base = Math.floor(total / 3);
  const remainder = total - base * 3;
  return {
    wood: base + (remainder > 0 ? 1 : 0),
    ore: base + (remainder > 1 ? 1 : 0),
    food: base,
  };
}

export function canAfford(resources: ResourcePool, cost: ResourcePool): boolean {
  return RESOURCE_TYPES.every((r) => resources[r] >= cost[r]);
}

export function subtractCost(resources: ResourcePool, cost: ResourcePool): ResourcePool {
  return {
    wood: resources.wood - cost.wood,
    ore: resources.ore - cost.ore,
    food: resources.food - cost.food,
  };
}

export function emptyResources(): ResourcePool {
  return { wood: 0, ore: 0, food: 0 };
}

export function categoryHash(name: string): BuildingCategory {
  const categories: BuildingCategory[] = ['production', 'training', 'rnd'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return categories[hash % categories.length];
}

export const CATEGORY_LABEL: Record<BuildingCategory, string> = {
  production: '⚙️ 生產類',
  training: '🎯 訓練類',
  rnd: '🔬 研發類',
};

// production→food, training→wood, rnd→ore, per spec 5.8.
export const CATEGORY_RESOURCE: Record<BuildingCategory, ResourceType> = {
  production: 'food',
  training: 'wood',
  rnd: 'ore',
};

export const RESOURCE_LABEL: Record<ResourceType, string> = {
  wood: '🪵 木材',
  ore: '⛏️ 鐵礦',
  food: '🌾 糧食',
};

export const RESOURCE_ICON: Record<ResourceType, string> = {
  wood: '🪵',
  ore: '⛏️',
  food: '🌾',
};

export function formatCost(cost: ResourcePool): string {
  return `${RESOURCE_ICON.wood}${cost.wood} ${RESOURCE_ICON.ore}${cost.ore} ${RESOURCE_ICON.food}${cost.food}`;
}

export function reviewGain(combo: number): number {
  return 1 + Math.floor(combo / 3);
}

// One-time reward for finishing every lesson in a course, paid entirely in
// ore since a course only ever lives under a research-center (rnd) domain.
// The spec (5.9) leaves the actual curve undecided; this is a placeholder
// default (5 ore per lesson) — see docs/implementation-decisions.md.
export function courseReward(lessonCount: number): number {
  return lessonCount * 5;
}

// "Round" is a real calendar day, not an answer count — see
// docs/implementation-decisions.md. Using wall-clock time means due dates
// always eventually arrive on their own, even if the player answers nothing.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function currentRound(): number {
  return Math.floor(Date.now() / MS_PER_DAY);
}

export function applyQuizAnswer(card: QuizCard, correct: boolean, round: number): QuizCard {
  if (correct) {
    const streak = card.streak + 1;
    const interval = Math.min(card.interval * 2, 30);
    return {
      ...card,
      streak,
      interval,
      stage: Math.min(3, Math.floor(streak / 2)),
      due: round + interval,
      claimed: true,
    };
  }
  return {
    ...card,
    streak: Math.max(0, card.streak - 1),
    interval: 1,
    stage: Math.max(0, card.stage - 1),
    due: round + 1,
  };
}

export const QUIZ_STAGE_LABEL = ['🌱 幼苗', '🌿 幼株', '🌳 成木', '✨ 覺醒'];
