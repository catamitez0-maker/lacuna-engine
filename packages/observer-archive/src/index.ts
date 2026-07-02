import {
  observerReportSchema,
  type AnchorVariant,
  type CityModule,
  type DailyPulse,
  type ObserverReport,
  type StoryDay,
  type Trace,
  type WorldPack,
} from "@lacuna-engine/schema";

export type CreateObserverReportInput = {
  world: WorldPack;
  city: CityModule;
  day: StoryDay;
  pulse: DailyPulse;
  traces: Trace[];
  selectedVariants: AnchorVariant[];
  now?: string;
};

export function createObserverReport({
  world,
  city,
  day,
  pulse,
  traces,
  selectedVariants,
  now = pulse.createdAt,
}: CreateObserverReportInput): ObserverReport {
  return observerReportSchema.parse({
    id: pulse.observerReportId,
    worldId: world.id,
    cityId: city.id,
    dayId: day.id,
    title: "Framework observer report",
    summary: `Observer report generated for ${city.id} on ${day.id}.`,
    traceSummary: traces.map(
      (trace) =>
        `${trace.id}: type=${trace.type}, visibility=${trace.visibility}, weight=${trace.weight}`,
    ),
    stateDeltaSummary: summarizeStateDelta(pulse),
    selectedVariantSummary: selectedVariants.map(
      (variant) => `${variant.id}: ${variant.title}`,
    ),
    ruleAuditSummary: summarizeRuleAudit(pulse),
    createdAt: now,
  });
}

function summarizeStateDelta(pulse: DailyPulse): string[] {
  const keys = new Set([
    ...Object.keys(pulse.stateBefore),
    ...Object.keys(pulse.stateAfter),
  ]);

  return [...keys].sort().map((key) => {
    const before = pulse.stateBefore[key] ?? 0;
    const after = pulse.stateAfter[key] ?? 0;
    return `${key}: ${before} -> ${after}`;
  });
}

function summarizeRuleAudit(pulse: DailyPulse): string[] {
  return pulse.ruleAudit
    .filter((entry) => entry.outcome !== "ok")
    .map((entry) => {
      const details = entry.messages.join("; ");
      return `${entry.ruleId}: ${entry.outcome} (${entry.before} -> ${entry.after}, proposed ${entry.proposed})${details ? ` - ${details}` : ""}`;
    });
}
