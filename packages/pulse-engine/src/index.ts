import { selectAnchorVariants } from "@lacuna-engine/anchor-resolver";
import {
  dailyPulseSchema,
  type AnchorEvent,
  type AnchorVariant,
  type CityModule,
  type DailyPulse,
  type NumericState,
  type RuleAuditEntry,
  type StateRule,
  type StoryDay,
  type Trace,
  type WorldPack,
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
  observerReportId = `${world.id}-${city.id}-${day.id}-observer-report`,
}: RunDailyPulseInput): DailyPulseResult {
  const stateAfterTraces = traces.reduce<NumericState>(
    (state, trace) => applyNumericEffects(state, trace.effects),
    { ...stateBefore },
  );
  const selectedVariants = selectAnchorVariants(
    anchor,
    stateAfterTraces,
    traces,
  );
  const proposedStateAfter = selectedVariants.reduce<NumericState>(
    (state, variant) => applyNumericEffects(state, variant.effects),
    stateAfterTraces,
  );
  const { stateAfter, ruleAudit } = applyStateRules({
    rules: world.stateRules,
    stateBefore,
    proposedStateAfter,
  });

  const pulse = dailyPulseSchema.parse({
    id: pulseId,
    worldId: world.id,
    cityId: city.id,
    dayId: day.id,
    stateBefore: { ...stateBefore },
    traceIds: traces.map((trace) => trace.id),
    stateAfter,
    selectedVariantIds: selectedVariants.map((variant) => variant.id),
    ruleAudit,
    observerReportId,
    createdAt: now,
  });

  return {
    pulse,
    selectedVariants,
  };
}

export type ApplyStateRulesInput = {
  rules: StateRule[];
  stateBefore: NumericState;
  proposedStateAfter: NumericState;
};

export type ApplyStateRulesResult = {
  stateAfter: NumericState;
  ruleAudit: RuleAuditEntry[];
};

export function applyStateRules({
  rules,
  stateBefore,
  proposedStateAfter,
}: ApplyStateRulesInput): ApplyStateRulesResult {
  const stateAfter = { ...proposedStateAfter };
  const ruleAudit = rules.map((rule) => {
    const before = stateBefore[rule.stateKey] ?? 0;
    const proposed = proposedStateAfter[rule.stateKey] ?? 0;
    const { after, messages } = evaluateStateRule(rule, before, proposed);
    const outcome =
      messages.length === 0
        ? "ok"
        : rule.enforcement === "clamp"
          ? "clamped"
          : "violation";

    if (rule.enforcement === "clamp") {
      stateAfter[rule.stateKey] = after;
    }

    return {
      ruleId: rule.id,
      stateKey: rule.stateKey,
      enforcement: rule.enforcement,
      outcome,
      before,
      proposed,
      after: rule.enforcement === "clamp" ? after : proposed,
      messages,
      constantRefs: rule.constantRefs,
    } satisfies RuleAuditEntry;
  });

  const rejected = ruleAudit.filter(
    (entry) => entry.enforcement === "reject" && entry.outcome === "violation",
  );
  if (rejected.length > 0) {
    throw new Error(
      `State rule rejection: ${rejected
        .map((entry) => `${entry.ruleId}: ${entry.messages.join("; ")}`)
        .join(" | ")}`,
    );
  }

  return {
    stateAfter,
    ruleAudit,
  };
}

function evaluateStateRule(
  rule: StateRule,
  before: number,
  proposed: number,
): { after: number; messages: string[] } {
  let after = proposed;
  const messages: string[] = [];

  if (rule.min !== undefined && after < rule.min) {
    messages.push(`${rule.stateKey} is below min ${rule.min}`);
    if (rule.enforcement === "clamp") {
      after = rule.min;
    }
  }

  if (rule.max !== undefined && after > rule.max) {
    messages.push(`${rule.stateKey} is above max ${rule.max}`);
    if (rule.enforcement === "clamp") {
      after = rule.max;
    }
  }

  if (
    rule.maxDailyDelta !== undefined &&
    Math.abs(after - before) > rule.maxDailyDelta
  ) {
    messages.push(
      `${rule.stateKey} daily delta ${Math.abs(after - before)} exceeds max ${rule.maxDailyDelta}`,
    );
    if (rule.enforcement === "clamp") {
      after = before + Math.sign(after - before) * rule.maxDailyDelta;
    }
  }

  return {
    after,
    messages,
  };
}

export function applyNumericEffects(
  state: NumericState,
  effects: NumericState,
): NumericState {
  const next = { ...state };

  for (const [key, value] of Object.entries(effects)) {
    next[key] = (next[key] ?? 0) + value;
  }

  return next;
}
