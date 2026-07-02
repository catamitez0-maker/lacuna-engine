import { ZodError } from "zod";
import { parse } from "yaml";
import { parseWorldPack, type WorldPack } from "@lacuna-engine/schema";

export type ContentValidationIssue = {
  worldId: string;
  message: string;
  path?: string;
};

export type ContentValidationResult = {
  worldId: string;
  ok: boolean;
  issues: ContentValidationIssue[];
  world?: WorldPack;
};

export type StructuredRecord = Record<string, unknown>;

export type LoadWorldPackSourceOptions = {
  sourcePath?: string;
  hydrate?: (world: StructuredRecord) => StructuredRecord;
};

export type ValidateWorldPackSourceOptions = LoadWorldPackSourceOptions & {
  worldId?: string;
};

export function loadWorldPackSource(
  source: string,
  options: LoadWorldPackSourceOptions = {},
): WorldPack {
  const sourcePath = options.sourcePath ?? "world.yaml";
  const raw = readStructuredSource(source, sourcePath);

  if (!isStructuredRecord(raw)) {
    throw new Error(`World Pack source must contain an object: ${sourcePath}`);
  }

  return parseWorldPack(options.hydrate ? options.hydrate(raw) : raw);
}

export function validateWorldPackSource(
  source: string,
  options: ValidateWorldPackSourceOptions = {},
): ContentValidationResult {
  const worldId = options.worldId ?? "source";

  try {
    const world = loadWorldPackSource(source, options);
    return {
      worldId: world.id,
      ok: true,
      issues: [],
      world,
    };
  } catch (error) {
    return {
      worldId,
      ok: false,
      issues: normalizeValidationError(worldId, error),
    };
  }
}

export function readStructuredSource(
  source: string,
  sourcePath = "world.yaml",
): unknown {
  return sourcePath.toLowerCase().endsWith(".json")
    ? JSON.parse(source)
    : parse(source);
}

export function asStructuredRecords(value: unknown): StructuredRecord[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isStructuredRecord);
  }

  return isStructuredRecord(value) ? [value] : [];
}

export function isStructuredRecord(value: unknown): value is StructuredRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeValidationError(
  worldId: string,
  error: unknown,
): ContentValidationIssue[] {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => ({
      worldId,
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  return [
    {
      worldId,
      message: error instanceof Error ? error.message : String(error),
    },
  ];
}
