import {
  traceSchema,
  type PlaceholderAction,
  type PlayerTimeline,
  type Trace,
} from "@lacuna-engine/schema";

export type CreateTraceInput = {
  timeline: PlayerTimeline;
  action: PlaceholderAction;
  now?: string;
  sequence?: number;
};

export function createTraceFromAction({
  timeline,
  action,
  now = new Date().toISOString(),
  sequence = 1,
}: CreateTraceInput): Trace {
  return traceSchema.parse({
    id: `${timeline.id}-trace-${sequence}`,
    playerTimelineId: timeline.id,
    worldId: timeline.worldId,
    cityId: timeline.cityId,
    dayId: timeline.currentDayId,
    type: action.trace.type,
    visibility: action.trace.visibility,
    weight: action.trace.weight,
    effects: action.trace.effects,
    createdAt: now,
  });
}
