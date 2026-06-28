import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { ZodError } from "zod";
import { parse } from "yaml";
import { parseWorldPack, type WorldPack } from "@lacuna-engine/schema";

export type LoadWorldPackOptions = {
  contentDir?: string;
  startDir?: string;
};

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

type StructuredRecord = Record<string, unknown>;

export function findWorkspaceRoot(startDir = process.cwd()): string {
  let current = resolve(startDir);

  while (true) {
    if (existsSync(join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      throw new Error(`Unable to find workspace root from ${startDir}`);
    }

    current = parent;
  }
}

export function resolveWorldsDir(options: LoadWorldPackOptions = {}): string {
  return (
    options.contentDir ??
    join(findWorkspaceRoot(options.startDir), "content", "worlds")
  );
}

export function listWorldPackIds(options: LoadWorldPackOptions = {}): string[] {
  const worldsDir = resolveWorldsDir(options);

  if (!existsSync(worldsDir)) {
    return [];
  }

  return readdirSync(worldsDir)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => statSync(join(worldsDir, entry)).isDirectory())
    .sort();
}

export function resolveWorldPackPath(
  worldId: string,
  options: LoadWorldPackOptions = {}
): string {
  return join(resolveWorldsDir(options), worldId);
}

export function loadWorldPackFromPath(worldPackPath: string): WorldPack {
  const worldFilePath = join(worldPackPath, "world.yaml");

  if (!existsSync(worldFilePath)) {
    throw new Error(`World Pack is missing world.yaml: ${worldPackPath}`);
  }

  const raw = readStructuredFile(worldFilePath);
  if (!isRecord(raw)) {
    throw new Error(`World Pack file must contain an object: ${worldFilePath}`);
  }

  return parseWorldPack(hydrateWorldPack(raw, worldPackPath));
}

export function loadWorldPackById(
  worldId: string,
  options: LoadWorldPackOptions = {}
): WorldPack {
  return loadWorldPackFromPath(resolveWorldPackPath(worldId, options));
}

export function loadEmptyWorldTemplate(
  options: LoadWorldPackOptions = {}
): WorldPack {
  return loadWorldPackById("empty-world-template", options);
}

export function validateWorldPackFromPath(
  worldPackPath: string
): ContentValidationResult {
  const worldId = worldPackPath.split(/[\\/]/).at(-1) ?? worldPackPath;

  try {
    const world = loadWorldPackFromPath(worldPackPath);
    return {
      worldId: world.id,
      ok: true,
      issues: [],
      world
    };
  } catch (error) {
    return {
      worldId,
      ok: false,
      issues: normalizeValidationError(worldId, error)
    };
  }
}

export function validateWorldPackById(
  worldId: string,
  options: LoadWorldPackOptions = {}
): ContentValidationResult {
  return validateWorldPackFromPath(resolveWorldPackPath(worldId, options));
}

export function validateAllWorldPacks(
  options: LoadWorldPackOptions = {}
): ContentValidationResult[] {
  return listWorldPackIds(options).map((worldId) =>
    validateWorldPackById(worldId, options)
  );
}

function hydrateWorldPack(raw: StructuredRecord, worldPackPath: string): StructuredRecord {
  const world = { ...raw };
  const cityBases = [...asArray(world["cities"]), ...readRecords(join(worldPackPath, "cities"))];
  const cities = cityBases.map((city) => hydrateCity(city, worldPackPath, cityBases.length));

  return {
    ...world,
    cities
  };
}

function hydrateCity(
  rawCity: StructuredRecord,
  worldPackPath: string,
  cityCount: number
): StructuredRecord {
  const city = { ...rawCity };
  const cityId = String(city["id"] ?? "");

  city["entryRoles"] = [
    ...asArray(city["entryRoles"]),
    ...readRoleRecords(worldPackPath, cityId, cityCount, "entryRoles")
  ];
  city["identityFragments"] = [
    ...asArray(city["identityFragments"]),
    ...readRoleRecords(worldPackPath, cityId, cityCount, "identityFragments")
  ];
  city["days"] = [
    ...asArray(city["days"]),
    ...readCityRecords(worldPackPath, "days", cityId, cityCount)
  ];
  city["anchors"] = [
    ...asArray(city["anchors"]),
    ...readCityRecords(worldPackPath, "anchors", cityId, cityCount)
  ];
  city["scenes"] = [
    ...asArray(city["scenes"]),
    ...readCityRecords(worldPackPath, "scenes", cityId, cityCount)
  ];
  city["prologueActions"] = [
    ...asArray(city["prologueActions"]),
    ...readCityRecords(worldPackPath, "prologue-actions", cityId, cityCount)
  ];
  city["placeholderActions"] = [
    ...asArray(city["placeholderActions"]),
    ...readActionRecords(worldPackPath, cityId, cityCount)
  ];

  return city;
}

function readRoleRecords(
  worldPackPath: string,
  cityId: string,
  cityCount: number,
  key: "entryRoles" | "identityFragments"
): StructuredRecord[] {
  const records = readRecords(join(worldPackPath, "roles"));
  const fragments = readRecords(join(worldPackPath, "fragments"));
  const unpacked = [...records, ...fragments].flatMap((record) => {
    if (Array.isArray(record[key])) {
      return record[key] as StructuredRecord[];
    }

    if (key === "entryRoles" && record["entryDayId"]) {
      return [record];
    }

    if (key === "identityFragments" && record["mappedRoleId"]) {
      return [record];
    }

    return [];
  });

  return filterCityRecords(unpacked, cityId, cityCount).map(stripCityId);
}

function readActionRecords(
  worldPackPath: string,
  cityId: string,
  cityCount: number
): StructuredRecord[] {
  const actionRecords = [
    ...readRecords(join(worldPackPath, "actions")),
    ...readRecords(join(worldPackPath, "traces"))
  ].flatMap((record) => {
    if (Array.isArray(record["placeholderActions"])) {
      return record["placeholderActions"] as StructuredRecord[];
    }

    if (record["trace"] && record["label"]) {
      return [record];
    }

    return [];
  });

  return filterCityRecords(actionRecords, cityId, cityCount).map(stripCityId);
}

function readCityRecords(
  worldPackPath: string,
  directoryName: string,
  cityId: string,
  cityCount: number
): StructuredRecord[] {
  return filterCityRecords(
    readRecords(join(worldPackPath, directoryName)),
    cityId,
    cityCount
  );
}

function filterCityRecords(
  records: StructuredRecord[],
  cityId: string,
  cityCount: number
): StructuredRecord[] {
  return records.filter((record) => {
    const recordCityId = record["cityId"];
    return recordCityId === cityId || (recordCityId === undefined && cityCount === 1);
  });
}

function stripCityId(record: StructuredRecord): StructuredRecord {
  const { cityId: _cityId, ...rest } = record;
  return rest;
}

function readRecords(directoryPath: string): StructuredRecord[] {
  if (!existsSync(directoryPath)) {
    return [];
  }

  return readdirSync(directoryPath)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => [".yaml", ".yml", ".json"].includes(extname(entry)))
    .sort()
    .flatMap((entry) => asArray(readStructuredFile(join(directoryPath, entry))));
}

function readStructuredFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");
  const extension = extname(filePath);
  return extension === ".json" ? JSON.parse(raw) : parse(raw);
}

function asArray(value: unknown): StructuredRecord[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  return isRecord(value) ? [value] : [];
}

function isRecord(value: unknown): value is StructuredRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeValidationError(
  worldId: string,
  error: unknown
): ContentValidationIssue[] {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => ({
      worldId,
      path: issue.path.join("."),
      message: issue.message
    }));
  }

  return [
    {
      worldId,
      message: error instanceof Error ? error.message : String(error)
    }
  ];
}
