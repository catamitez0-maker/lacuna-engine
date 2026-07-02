import type {
  CityModule,
  PlayerTimeline,
  Scene,
  StoryDay,
} from "@lacuna-engine/schema";

export function getPrimaryCity(world: { cities: CityModule[] }): CityModule {
  return firstEntity(world.cities, "World Pack has no city modules");
}

export function getEntryScene(
  city: CityModule,
  timeline: PlayerTimeline,
): Scene {
  return findById(city.scenes, timeline.currentSceneId, "scene");
}

export function getCurrentDay(
  city: CityModule,
  timeline: PlayerTimeline,
): StoryDay {
  return findById(city.days, timeline.currentDayId, "day");
}

export function firstEntity<T>(items: readonly T[], message: string): T {
  const [first] = items;

  if (!first) {
    throw new Error(message);
  }

  return first;
}

export function findById<T extends { id: string }>(
  items: readonly T[],
  id: string,
  label: string,
): T {
  const entity = findOptionalById(items, id);

  if (!entity) {
    throw new Error(`Missing ${label} ${id}`);
  }

  return entity;
}

export function findOptionalById<T extends { id: string }>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((candidate) => candidate.id === id);
}
