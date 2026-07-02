import type {
  AnchorEvent,
  AnchorVariant,
  Condition,
  StateValue,
  Trace,
  TraceCondition,
} from "@lacuna-engine/schema";

export type StateLookup = Record<string, StateValue | undefined>;

export function evaluateCondition(
  condition: Condition,
  state: StateLookup,
): boolean {
  const actual = state[condition.key];

  switch (condition.operator) {
    case ">":
      return compareNumbers(
        actual,
        condition.value,
        (left, right) => left > right,
      );
    case ">=":
      return compareNumbers(
        actual,
        condition.value,
        (left, right) => left >= right,
      );
    case "<":
      return compareNumbers(
        actual,
        condition.value,
        (left, right) => left < right,
      );
    case "<=":
      return compareNumbers(
        actual,
        condition.value,
        (left, right) => left <= right,
      );
    case "==":
      return actual === condition.value;
    case "!=":
      return actual !== condition.value;
  }
}

export function selectAnchorVariants(
  anchor: AnchorEvent | undefined,
  state: StateLookup,
  traces: Trace[] = [],
): AnchorVariant[] {
  if (!anchor) {
    return [];
  }

  return anchor.variants.filter(
    (variant) =>
      variant.conditions.every((condition) =>
        evaluateCondition(condition, state),
      ) &&
      variant.traceConditions.every((condition) =>
        evaluateTraceCondition(condition, traces),
      ),
  );
}

export function evaluateTraceCondition(
  condition: TraceCondition,
  traces: Trace[],
): boolean {
  const matchingCount = traces.filter((trace) => {
    if (condition.type && trace.type !== condition.type) {
      return false;
    }

    if (condition.visibility && trace.visibility !== condition.visibility) {
      return false;
    }

    return true;
  }).length;

  return matchingCount >= condition.minCount;
}

function compareNumbers(
  actual: StateValue | undefined,
  expected: StateValue,
  comparator: (left: number, right: number) => boolean,
): boolean {
  if (typeof actual !== "number" || typeof expected !== "number") {
    return false;
  }

  return comparator(actual, expected);
}
