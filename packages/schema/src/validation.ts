import { z } from "zod";

export function idsFor(items: Array<{ id: string }>): Set<string> {
  return new Set(items.map((item) => item.id));
}

export function mapById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function reportDuplicateIds(
  ctx: z.RefinementCtx,
  label: string,
  items: Array<{ id: string }>,
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  for (const id of duplicates) {
    addIssue(ctx, `${label} contains duplicate id ${id}`);
  }
}

export function reportDuplicateValues<T extends string | number>(
  ctx: z.RefinementCtx,
  message: string,
  values: T[],
): void {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  for (const value of duplicates) {
    addIssue(ctx, `${message} ${value}`);
  }
}

export function requirePrologueActionCoverage(
  ctx: z.RefinementCtx,
  actions: Array<{ label: "observe" | "help" | "hide"; tendency: string }>,
): void {
  for (const label of ["observe", "help", "hide"] as const) {
    const matches = actions.filter((action) => action.label === label);

    if (matches.length !== 1) {
      addIssue(ctx, `prologueActions must contain exactly one ${label} action`);
    }
  }

  for (const action of actions) {
    if (action.label !== action.tendency) {
      addIssue(
        ctx,
        `prologueAction ${action.label} tendency must match its label`,
      );
    }
  }
}

export function requireReference(
  ctx: z.RefinementCtx,
  ids: Set<string>,
  referencedId: string,
  label: string,
): void {
  if (!ids.has(referencedId)) {
    addIssue(ctx, `${label} references missing id ${referencedId}`);
  }
}

export function requireStateKey(
  ctx: z.RefinementCtx,
  stateKeys: Set<string>,
  key: string,
  label: string,
): void {
  if (!stateKeys.has(key)) {
    addIssue(ctx, `${label} is not declared in stateSchema`);
  }
}

export function requireSameCity(
  ctx: z.RefinementCtx,
  cityId: string,
  referencedCityId: string,
  label: string,
): void {
  if (referencedCityId !== cityId) {
    addIssue(ctx, `${label} cityId must be ${cityId}`);
  }
}

export function addIssue(ctx: z.RefinementCtx, message: string): void {
  ctx.addIssue({
    code: "custom",
    message,
  });
}
