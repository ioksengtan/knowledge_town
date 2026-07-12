import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, Course, Domain, GameState, QuizCard, ResourceType, TownMap } from './types';
import { createSeedCards, createSeedDomains, createSeedMap, SEED_MAP_ID } from './seed';
import {
  applyQuizAnswer,
  canAfford,
  categoryHash,
  CATEGORY_RESOURCE,
  courseReward,
  currentRound,
  emptyResources,
  expansionCost,
  INITIAL_LAND_CAPACITY,
  LAND_PER_EXPANSION,
  reviewGain,
  splitCost,
  subtractCost,
  upgradeCost,
} from './logic';

export interface RewardResult {
  gained: number;
  resourceType: ResourceType | null; // null when nothing was gained (e.g. mid-course lesson)
  courseCompleted: boolean;
}

export type AnswerQuizResult = RewardResult & { correct: boolean; notDue: boolean };

interface Actions {
  selectMap: (mapId: string) => void;
  createMap: (name: string) => string;
  upgradeTownHall: (mapId: string) => void;
  upgradeDomain: (domainId: string) => void;
  expandLand: (mapId: string) => void;
  addDomain: (mapId: string, name: string, description: string) => string | null;
  answerQuiz: (cardId: string, choiceIndex: number) => AnswerQuizResult;
  completeReading: (cardId: string) => RewardResult;
}

type Store = GameState & Actions;

function seedState(): GameState {
  const map = createSeedMap();
  const domains = createSeedDomains();
  const cards = createSeedCards();
  return {
    maps: { [map.id]: map },
    domains: Object.fromEntries(domains.map((d) => [d.id, d])),
    cards: Object.fromEntries(cards.map((c) => [c.id, c])),
    courses: {},
    activeMapId: SEED_MAP_ID,
  };
}

// A course lesson is "done" for completion purposes once its card is
// claimed — the card just being updated (cardId) may not be in the cards
// map yet at call time, so it's checked separately from the rest.
function courseLessonsDone(cards: Record<string, Card>, lessonIds: string[], justClaimedId: string): boolean {
  return lessonIds.every((id) => id === justClaimedId || cards[id]?.claimed);
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seedState(),

      selectMap: (mapId) => set({ activeMapId: mapId }),

      createMap: (name) => {
        const id = `map-${Date.now()}`;
        const map: TownMap = {
          id,
          name,
          theme: 'last-war',
          resources: emptyResources(),
          combo: 0,
          landCapacity: { used: 0, total: INITIAL_LAND_CAPACITY },
          townHallLevel: 1,
          createdAt: Date.now(),
        };
        set((s) => ({ maps: { ...s.maps, [id]: map }, activeMapId: id }));
        return id;
      },

      upgradeTownHall: (mapId) => {
        const map = get().maps[mapId];
        if (!map) return;
        const cost = splitCost(upgradeCost(map.townHallLevel));
        if (!canAfford(map.resources, cost)) return;
        set((s) => ({
          maps: {
            ...s.maps,
            [mapId]: { ...map, resources: subtractCost(map.resources, cost), townHallLevel: map.townHallLevel + 1 },
          },
        }));
      },

      upgradeDomain: (domainId) => {
        const domain = get().domains[domainId];
        if (!domain) return;
        const map = get().maps[domain.mapId];
        if (!map) return;
        if (domain.level >= map.townHallLevel) return; // town hall cap
        const cost = splitCost(upgradeCost(domain.level));
        if (!canAfford(map.resources, cost)) return;
        set((s) => ({
          maps: { ...s.maps, [map.id]: { ...map, resources: subtractCost(map.resources, cost) } },
          domains: { ...s.domains, [domainId]: { ...domain, level: domain.level + 1 } },
        }));
      },

      expandLand: (mapId) => {
        const map = get().maps[mapId];
        if (!map) return;
        const expansionsSoFar = Math.round(
          (map.landCapacity.total - INITIAL_LAND_CAPACITY) / LAND_PER_EXPANSION
        );
        const cost = splitCost(expansionCost(expansionsSoFar));
        if (!canAfford(map.resources, cost)) return;
        set((s) => ({
          maps: {
            ...s.maps,
            [mapId]: {
              ...map,
              resources: subtractCost(map.resources, cost),
              landCapacity: { ...map.landCapacity, total: map.landCapacity.total + LAND_PER_EXPANSION },
            },
          },
        }));
      },

      addDomain: (mapId, name, description) => {
        const map = get().maps[mapId];
        if (!map) return null;
        if (map.landCapacity.used >= map.landCapacity.total) return null;
        const id = `domain-${Date.now()}`;
        const domain: Domain = {
          id,
          mapId,
          name,
          description,
          category: categoryHash(name),
          level: 1,
          slotIndex: map.landCapacity.used,
        };
        set((s) => ({
          domains: { ...s.domains, [id]: domain },
          maps: { ...s.maps, [mapId]: { ...map, landCapacity: { ...map.landCapacity, used: map.landCapacity.used + 1 } } },
        }));
        return id;
      },

      answerQuiz: (cardId, choiceIndex) => {
        const card = get().cards[cardId] as QuizCard;
        if (!card || card.type !== 'quiz') return { correct: false, gained: 0, resourceType: null, courseCompleted: false, notDue: false };
        const round = currentRound();
        if (card.due > round) return { correct: false, gained: 0, resourceType: null, courseCompleted: false, notDue: true };
        const domain = get().domains[card.domainId];
        const map = get().maps[domain.mapId];
        const correct = choiceIndex === card.answerIndex;
        const updatedCard = applyQuizAnswer(card, correct, round);
        const combo = correct ? map.combo + 1 : 0;

        let gained = 0;
        let resourceType: ResourceType | null = null;
        let courseCompleted = false;
        let resources = map.resources;
        let courses = get().courses;

        if (correct) {
          if (card.courseId) {
            const course = courses[card.courseId];
            if (course && !course.completed && courseLessonsDone(get().cards, course.lessonIds, cardId)) {
              gained = courseReward(course.lessonIds.length);
              resourceType = 'ore';
              courseCompleted = true;
              courses = { ...courses, [card.courseId]: { ...course, completed: true } };
              resources = { ...resources, ore: resources.ore + gained };
            }
          } else {
            gained = reviewGain(map.combo);
            resourceType = CATEGORY_RESOURCE[domain.category];
            resources = { ...resources, [resourceType]: resources[resourceType] + gained };
          }
        }

        set((s) => ({
          cards: { ...s.cards, [cardId]: updatedCard },
          maps: { ...s.maps, [map.id]: { ...map, combo, resources } },
          courses,
        }));
        return { correct, gained, resourceType, courseCompleted, notDue: false };
      },

      completeReading: (cardId) => {
        const card = get().cards[cardId];
        if (!card || card.type !== 'reading' || card.claimed) return { gained: 0, resourceType: null, courseCompleted: false };
        const domain = get().domains[card.domainId];
        const map = get().maps[domain.mapId];

        let gained = 0;
        let resourceType: ResourceType | null = null;
        let courseCompleted = false;
        let resources = map.resources;
        let courses = get().courses;

        if (card.courseId) {
          const course = courses[card.courseId];
          if (course && !course.completed && courseLessonsDone(get().cards, course.lessonIds, cardId)) {
            gained = courseReward(course.lessonIds.length);
            resourceType = 'ore';
            courseCompleted = true;
            courses = { ...courses, [card.courseId]: { ...course, completed: true } };
            resources = { ...resources, ore: resources.ore + gained };
          }
        } else {
          gained = card.pages.length;
          resourceType = CATEGORY_RESOURCE[domain.category];
          resources = { ...resources, [resourceType]: resources[resourceType] + gained };
        }

        set((s) => ({
          cards: { ...s.cards, [cardId]: { ...card, claimed: true } },
          maps: { ...s.maps, [map.id]: { ...map, resources } },
          courses,
        }));
        return { gained, resourceType, courseCompleted };
      },
    }),
    { name: 'knowledge-town-save-v4' }
  )
);

export function domainsForMap(domains: Record<string, Domain>, mapId: string): Domain[] {
  return Object.values(domains)
    .filter((d) => d.mapId === mapId)
    .sort((a, b) => a.slotIndex - b.slotIndex);
}

export function cardsForDomain(cards: Record<string, Card>, domainId: string): Card[] {
  return Object.values(cards).filter((c) => c.domainId === domainId);
}

export function coursesForDomain(courses: Record<string, Course>, domainId: string): Course[] {
  return Object.values(courses).filter((c) => c.domainId === domainId);
}
