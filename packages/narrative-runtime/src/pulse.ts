import { createObserverReport } from "@lacuna-engine/observer-archive";
import { runDailyPulse } from "@lacuna-engine/pulse-engine";
import { getCurrentDay, findOptionalById } from "./entities";
import { createObserverReportId, createPulseId } from "./ids";
import type { RuntimePulseInput, RuntimePulseResult } from "./types";

export function settleRuntimePulse({
  world,
  city,
  timeline,
  traces,
  now,
}: RuntimePulseInput): RuntimePulseResult {
  const day = getCurrentDay(city, timeline);
  const anchor = day.anchorId
    ? findOptionalById(city.anchors, day.anchorId)
    : undefined;
  const observerReportId = createObserverReportId(timeline, day);
  const { pulse, selectedVariants } = runDailyPulse({
    world,
    city,
    day,
    traces,
    anchor,
    now,
    pulseId: createPulseId(timeline, day),
    observerReportId,
  });
  const observerReport = createObserverReport({
    world,
    city,
    day,
    pulse,
    traces,
    selectedVariants,
    now,
  });

  return {
    pulse,
    observerReport,
  };
}
