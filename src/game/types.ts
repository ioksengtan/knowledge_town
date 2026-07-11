export type BuildingCategory = 'production' | 'training' | 'hero' | 'rnd';

export interface QuizCard {
  id: string;
  domainId: string;
  type: 'quiz';
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
  streak: number;
  interval: number;
  stage: number; // 0-3, growth stage for the card itself (🌱🌿🌳✨)
  due: number; // round number
  claimed: boolean;
}

export interface ReadingCard {
  id: string;
  domainId: string;
  type: 'reading';
  title: string;
  pages: string[];
  claimed: boolean;
}

export type Card = QuizCard | ReadingCard;

export interface Domain {
  id: string;
  mapId: string;
  name: string;
  description: string;
  category: BuildingCategory;
  level: number;
  slotIndex: number; // position in the map's shared buildable land, in build order
}

export interface LandCapacity {
  used: number;
  total: number;
}

export interface TownMap {
  id: string;
  name: string;
  theme: 'last-war';
  resources: number;
  combo: number;
  round: number;
  landCapacity: LandCapacity;
  townHallLevel: number;
  createdAt: number;
}

export interface GameState {
  maps: Record<string, TownMap>;
  domains: Record<string, Domain>;
  cards: Record<string, Card>;
  activeMapId: string | null;
}
