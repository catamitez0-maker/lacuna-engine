import type {
  CityModule,
  IdentityFragment,
  PlayerTimeline,
  StoryDay,
  WorldPack,
} from "@lacuna-engine/schema";

export function createTimelineId(
  world: Pick<WorldPack, "id">,
  city: Pick<CityModule, "id">,
  fragment: Pick<IdentityFragment, "id">,
): string {
  return `${world.id}-${city.id}-${fragment.id}-timeline`;
}

export function createPulseId(
  timeline: Pick<PlayerTimeline, "id">,
  day: Pick<StoryDay, "id">,
): string {
  return `${timeline.id}-${day.id}-pulse`;
}

export function createObserverReportId(
  timeline: Pick<PlayerTimeline, "id">,
  day: Pick<StoryDay, "id">,
): string {
  return `${timeline.id}-${day.id}-observer-report`;
}
