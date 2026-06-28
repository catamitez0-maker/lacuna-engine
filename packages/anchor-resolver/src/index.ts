import type {
  AnchorEvent,
  AnchorVariant,
  Condition,
  StateValue
} from "@lacuna-engine/schema";

export type StateLookup = Record<string, StateValue | undefined>;

export function evaluateCondition(
  condition: Condition,
  state: StateLookup
): boolean {
  const actual = state[condition.key];

  switch (condition.operator) {
    case ">":
      return compareNumbers(actual, condition.value, (left, right) => left > right);
    case ">=":
      return compareNumbers(actual, condition.value, (left, right) => left >= right);
    case "<":
      return compareNumbers(actual, condition.value, (left, right) => left < right);
    case "<=":
      return compareNumbers(actual, condition.value, (left, right) => left <= right);
    case "==":
      return actual === condition.value;
    case "!=":
      return actual !== condition.value;
  }
}

export function selectAnchorVariants(
  anchor: AnchorEvent | undefined,
  state: StateLookup
): AnchorVariant[] {
  if (!anchor) {
    return [];
  }

  return anchor.variants.filter((variant) =>
    variant.conditions.every((condition) => evaluateCondition(condition, state))
  );
}

function compareNumbers(
  actual: StateValue | undefined,
  expected: StateValue,
  comparator: (left: number, right: number) => boolean
): boolean {
  if (typeof actual !== "number" || typeof expected !== "number") {
    return false;
  }

  return comparator(actual, expected);
}
