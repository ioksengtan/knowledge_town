export type BuildingCategory = 'production' | 'training' | 'rnd';

export type ResourceType = 'wood' | 'ore' | 'food';

export type ResourcePool = Record<ResourceType, number>;

export interface QuizCard {
  id: string;
  domainId: string;
  type: 'quiz';
  question: string;
  choices: string[];
  answerIndex: number;
  example?: string;
  courseId?: string | null;
  streak: number;
  interval: number;
  stage: number; // 0-3, growth stage for the card itself (🌱🌿🌳✨)
  due: number; // round number
  claimed: boolean;
}

export interface ReadingPage {
  content: string;
  example?: string;
}

export interface ReadingCard {
  id: string;
  domainId: string;
  type: 'reading';
  title: string;
  source?: string;
  courseId?: string | null;
  pages: ReadingPage[];
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
  isResearchCenter?: boolean; // at most one rnd-category domain per map
}

export interface Course {
  id: string;
  name: string;
  domainId: string; // must point to a domain with isResearchCenter = true
  lessonIds: string[]; // Card ids
  completed: boolean;
}

export interface LandCapacity {
  used: number;
  total: number;
}

export interface TownMap {
  id: string;
  name: string;
  theme: 'last-war';
  resources: ResourcePool;
  combo: number;
  landCapacity: LandCapacity;
  townHallLevel: number;
  createdAt: number;
}

export interface GameState {
  maps: Record<string, TownMap>;
  domains: Record<string, Domain>;
  cards: Record<string, Card>;
  courses: Record<string, Course>;
  activeMapId: string | null;
}
