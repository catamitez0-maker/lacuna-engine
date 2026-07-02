import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import type { WorldPack } from "@lacuna-engine/schema";
import {
  asStructuredRecords,
  isStructuredRecord,
  loadWorldPackSource,
  normalizeValidationError,
  readStructuredSource,
  type ContentValidationResult,
  type StructuredRecord,
} from "./index";

export type LoadWorldPackOptions = {
  contentDir: string;
};

export function resolveWorldsDir(options: LoadWorldPackOptions): string {
  return resolve(options.contentDir);
}

export function listWorldPackIds(options: LoadWorldPackOptions): string[] {
  const worldsDir = resolveWorldsDir(options);

  if (!existsSync(worldsDir)) {
    return [];
  }

  return readdirSync(worldsDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function resolveWorldPackPath(
  worldId: string,
  options: LoadWorldPackOptions,
): string {
  return join(resolveWorldsDir(options), worldId);
}

export function resolveWorldPackFilePath(
  worldId: string,
  options: LoadWorldPackOptions,
): string {
  return join(resolveWorldPackPath(worldId, options), "world.yaml");
}

export function readWorldPackSourceById(
  worldId: string,
  options: LoadWorldPackOptions,
): string {
  return readFileSync(resolveWorldPackFilePath(worldId, options), "utf8");
}

export function loadWorldPackFromPath(worldPackPath: string): WorldPack {
  const worldFilePath = join(worldPackPath, "world.yaml");

  if (!existsSync(worldFilePath)) {
    throw new Error(`World Pack is missing world.yaml: ${worldPackPath}`);
  }

  return loadWorldPackSource(readFileSync(worldFilePath, "utf8"), {
    sourcePath: worldFilePath,
    hydrate: (world) => hydrateWorldPack(world, worldPackPath),
  });
}

export function loadWorldPackSourceFromPath(
  worldPackPath: string,
  source: string,
  sourcePath = join(worldPackPath, "world.yaml"),
): WorldPack {
  return loadWorldPackSource(source, {
    sourcePath,
    hydrate: (world) => hydrateWorldPack(world, worldPackPath),
  });
}

export function loadWorldPackById(
  worldId: string,
  options: LoadWorldPackOptions,
): WorldPack {
  return loadWorldPackFromPath(resolveWorldPackPath(worldId, options));
}

export function loadEmptyWorldTemplate(
  options: LoadWorldPackOptions,
): WorldPack {
  return loadWorldPackById("empty-world-template", options);
}

export function validateWorldPackFromPath(
  worldPackPath: string,
): ContentValidationResult {
  const worldId = worldPackPath.split(/[\\/]/).at(-1) ?? worldPackPath;

  try {
    const world = loadWorldPackFromPath(worldPackPath);
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

export function validateWorldPackSourceFromPath(
  worldPackPath: string,
  source: string,
  sourcePath = join(worldPackPath, "world.yaml"),
): ContentValidationResult {
  const worldId = worldPackPath.split(/[\\/]/).at(-1) ?? worldPackPath;

  try {
    const world = loadWorldPackSourceFromPath(
      worldPackPath,
      source,
      sourcePath,
    );
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

export function validateWorldPackById(
  worldId: string,
  options: LoadWorldPackOptions,
): ContentValidationResult {
  return validateWorldPackFromPath(resolveWorldPackPath(worldId, options));
}

export function validateAllWorldPacks(
  options: LoadWorldPackOptions,
): ContentValidationResult[] {
  return listWorldPackIds(options).map((worldId) =>
    validateWorldPackById(worldId, options),
  );
}

function hydrateWorldPack(
  raw: StructuredRecord,
  worldPackPath: string,
): StructuredRecord {
  const world = { ...raw };
  const cityBases = [
    ...asStructuredRecords(world["cities"]),
    ...readRecords(join(worldPackPath, "cities")),
  ];
  const cities = cityBases.map((city) =>
    hydrateCity(city, worldPackPath, cityBases.length),
  );

  return {
    ...world,
    cities,
  };
}

function hydrateCity(
  rawCity: StructuredRecord,
  worldPackPath: string,
  cityCount: number,
): StructuredRecord {
  const city = { ...rawCity };
  const cityId = String(city["id"] ?? "");

  city["entryRoles"] = [
    ...asStructuredRecords(city["entryRoles"]),
    ...readRoleRecords(worldPackPath, cityId, cityCount, "entryRoles"),
  ];
  city["identityFragments"] = [
    ...asStructuredRecords(city["identityFragments"]),
    ...readRoleRecords(worldPackPath, cityId, cityCount, "identityFragments"),
  ];
  city["days"] = [
    ...asStructuredRecords(city["days"]),
    ...readCityRecords(worldPackPath, "days", cityId, cityCount),
  ];
  city["anchors"] = [
    ...asStructuredRecords(city["anchors"]),
    ...readCityRecords(worldPackPath, "anchors", cityId, cityCount),
  ];
  city["scenes"] = [
    ...asStructuredRecords(city["scenes"]),
    ...readCityRecords(worldPackPath, "scenes", cityId, cityCount),
  ];
  city["prologueActions"] = [
    ...asStructuredRecords(city["prologueActions"]),
    ...readCityRecords(worldPackPath, "prologue-actions", cityId, cityCount),
  ];
  city["placeholderActions"] = [
    ...asStructuredRecords(city["placeholderActions"]),
    ...readActionRecords(worldPackPath, cityId, cityCount),
  ];

  return city;
}

function readRoleRecords(
  worldPackPath: string,
  cityId: string,
  cityCount: number,
  key: "entryRoles" | "identityFragments",
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
  cityCount: number,
): StructuredRecord[] {
  const actionRecords = [
    ...readRecords(join(worldPackPath, "actions")),
    ...readRecords(join(worldPackPath, "traces")),
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
  cityCount: number,
): StructuredRecord[] {
  return filterCityRecords(
    readRecords(join(worldPackPath, directoryName)),
    cityId,
    cityCount,
  );
}

function filterCityRecords(
  records: StructuredRecord[],
  cityId: string,
  cityCount: number,
): StructuredRecord[] {
  return records.filter((record) => {
    const recordCityId = record["cityId"];
    return (
      recordCityId === cityId || (recordCityId === undefined && cityCount === 1)
    );
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

  return readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((entry) => !entry.startsWith("."))
    .filter((entry) => [".yaml", ".yml", ".json"].includes(extname(entry)))
    .sort()
    .flatMap((entry) =>
      asStructuredRecords(readStructuredFile(join(directoryPath, entry))),
    );
}

function readStructuredFile(filePath: string): unknown {
  return readStructuredSource(readFileSync(filePath, "utf8"), filePath);
}

export { isStructuredRecord };
