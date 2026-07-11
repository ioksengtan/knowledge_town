import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, Domain, GameState, QuizCard, TownMap } from './types';
import { createSeedCards, createSeedDomains, createSeedMap, SEED_MAP_ID } from './seed';
import {
  applyQuizAnswer,
  categoryHash,
  expansionCost,
  INITIAL_LAND_CAPACITY,
  LAND_PER_EXPANSION,
  reviewGain,
  upgradeCost,
} from './logic';

interface Actions {
  selectMap: (mapId: string) => void;
  createMap: (name: string) => string;
  upgradeTownHall: (mapId: string) => void;
  upgradeDomain: (domainId: string) => void;
  expandLand: (mapId: string) => void;
  addDomain: (mapId: string, name: string, description: string) => string | null;
  answerQuiz: (cardId: string, choiceIndex: number) => { correct: boolean; gained: number };
  completeReading: (cardId: string) => number;
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
    activeMapId: SEED_MAP_ID,
  };
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
          resources: 0,
          combo: 0,
          round: 0,
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
        const cost = upgradeCost(map.townHallLevel);
        if (map.resources < cost) return;
        set((s) => ({
          maps: {
            ...s.maps,
            [mapId]: { ...map, resources: map.resources - cost, townHallLevel: map.townHallLevel + 1 },
          },
        }));
      },

      upgradeDomain: (domainId) => {
        const domain = get().domains[domainId];
        if (!domain) return;
        const map = get().maps[domain.mapId];
        if (!map) return;
        if (domain.level >= map.townHallLevel) return; // town hall cap
        const cost = upgradeCost(domain.level);
        if (map.resources < cost) return;
        set((s) => ({
          maps: { ...s.maps, [map.id]: { ...map, resources: map.resources - cost } },
          domains: { ...s.domains, [domainId]: { ...domain, level: domain.level + 1 } },
        }));
      },

      expandLand: (mapId) => {
        const map = get().maps[mapId];
        if (!map) return;
        const expansionsSoFar = Math.round(
          (map.landCapacity.total - INITIAL_LAND_CAPACITY) / LAND_PER_EXPANSION
        );
        const cost = expansionCost(expansionsSoFar);
        if (map.resources < cost) return;
        set((s) => ({
          maps: {
            ...s.maps,
            [mapId]: {
              ...map,
              resources: map.resources - cost,
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
        if (!card || card.type !== 'quiz') return { correct: false, gained: 0 };
        const domain = get().domains[card.domainId];
        const map = get().maps[domain.mapId];
        const correct = choiceIndex === card.answerIndex;
        const round = map.round + 1;
        const updated = applyQuizAnswer(card, correct, round);
        const combo = correct ? map.combo + 1 : 0;
        const gained = correct ? reviewGain(map.combo) : 0;
        set((s) => ({
          cards: { ...s.cards, [cardId]: updated },
          maps: {
            ...s.maps,
            [map.id]: { ...map, round, combo, resources: map.resources + gained },
          },
        }));
        return { correct, gained };
      },

      completeReading: (cardId) => {
        const card = get().cards[cardId];
        if (!card || card.type !== 'reading' || card.claimed) return 0;
        const domain = get().domains[card.domainId];
        const map = get().maps[domain.mapId];
        const gained = card.pages.length;
        set((s) => ({
          cards: { ...s.cards, [cardId]: { ...card, claimed: true } },
          maps: { ...s.maps, [map.id]: { ...map, resources: map.resources + gained } },
        }));
        return gained;
      },
    }),
    { name: 'knowledge-town-save-v1' }
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
