import { selectAnchorVariants } from "@lacuna-engine/anchor-resolver";
import {
  dailyPulseSchema,
  type AnchorEvent,
  type AnchorVariant,
  type CityModule,
  type DailyPulse,
  type NumericState,
  type StoryDay,
  type Trace,
  type WorldPack
} from "@lacuna-engine/schema";

export type RunDailyPulseInput = {
  world: WorldPack;
  city: CityModule;
  day: StoryDay;
  traces: Trace[];
  anchor?: AnchorEvent;
  stateBefore?: NumericState;
  now?: string;
  pulseId?: string;
  observerReportId?: string;
};

export type DailyPulseResult = {
  pulse: DailyPulse;
  selectedVariants: AnchorVariant[];
};

export function runDailyPulse({
  world,
  city,
  day,
  traces,
  anchor,
  stateBefore = city.initialState,
  now = new Date().toISOString(),
  pulseId = `${world.id}-${city.id}-${day.id}-pulse`,
  observerReportId = `${world.id}-${city.id}-${day.id}-observer-report`
}: RunDailyPulseInput): DailyPulseResult {
  const stateAfterTraces = traces.reduce<NumericState>(
    (state, trace) => applyNumericEffects(state, trace.effects),
    { ...stateBefore }
  );
  const selectedVariants = selectAnchorVariants(anchor, stateAfterTraces);
  const stateAfter = selectedVariants.reduce<NumericState>(
    (state, variant) => applyNumericEffects(state, variant.effects),
    stateAfterTraces
  );

  const pulse = dailyPulseSchema.parse({
    id: pulseId,
    worldId: world.id,
    cityId: city.id,
    dayId: day.id,
    stateBefore: { ...stateBefore },
    traceIds: traces.map((trace) => trace.id),
    stateAfter,
    selectedVariantIds: selectedVariants.map((variant) => variant.id),
    observerReportId,
    createdAt: now
  });

  return {
    pulse,
    selectedVariants
  };
}

export function applyNumericEffects(
  state: NumericState,
  effects: NumericState
): NumericState {
  const next = { ...state };

  for (const [key, value] of Object.entries(effects)) {
    next[key] = (next[key] ?? 0) + value;
  }

  return next;
}
