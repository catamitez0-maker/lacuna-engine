"use server";

import { readFileSync, writeFileSync } from "node:fs";
import { sep } from "node:path";
import { join, resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { parse, stringify } from "yaml";
import { safeApplyStructuredPatch } from "@lacuna-engine/world-authoring";
import {
  listWorldPackIds,
  resolveWorldPackFilePath,
  resolveWorldPackPath,
  validateWorldPackSourceFromPath,
} from "@lacuna-engine/content-loader/server";
import { type ContentValidationIssue } from "@lacuna-engine/content-loader";

export type SaveWorldPackSourceState =
  | {
      ok: true;
      message: string;
      issues: ContentValidationIssue[];
      savedAt?: string;
    }
  | {
      ok: false;
      message: string;
      issues: ContentValidationIssue[];
      savedAt?: string;
    };

export type SaveWorldPackStructuredState = SaveWorldPackSourceState;

type StructuredRecord = Record<string, unknown>;
type EditableWorldTarget = {
  sourcePath: string;
  worldPackPath: string;
};
type ParsedWorldSource =
  | { world: StructuredRecord }
  | { error: SaveWorldPackStructuredState };

const CONTENT_DIR = join(
  /* turbopackIgnore: true */ process.cwd(),
  "../../content/worlds",
);
const initialSuccessState: SaveWorldPackSourceState = {
  ok: true,
  message: "",
  issues: [],
};

export async function saveWorldPackSourceAction(
  _state: SaveWorldPackSourceState,
  formData: FormData,
): Promise<SaveWorldPackSourceState> {
  const worldId = String(formData.get("worldId") ?? "");
  const source = String(formData.get("source") ?? "");

  if (!worldId || !source.trim()) {
    return {
      ok: false,
      message: "World Pack id and source are required.",
      issues: [],
    };
  }

  const target = getEditableWorldTarget(worldId);
  if (!target) {
    return {
      ok: false,
      message: `Unknown World Pack: ${worldId}`,
      issues: [],
    };
  }

  return saveValidatedWorldSource(
    worldId,
    source,
    target,
    "World Pack saved and validated.",
  );
}

export async function saveWorldPackStructuredAction(
  _state: SaveWorldPackStructuredState,
  formData: FormData,
): Promise<SaveWorldPackStructuredState> {
  const worldId = String(formData.get("worldId") ?? "");
  const target = getEditableWorldTarget(worldId);

  if (!target) {
    return {
      ok: false,
      message: `Unknown World Pack: ${worldId}`,
      issues: [],
    };
  }

  const source = readFileSync(target.sourcePath, "utf8");
  const raw = parseEditableWorldSource(source, target.sourcePath);

  if ("error" in raw) {
    return raw.error;
  }

  const patchResult = safeApplyStructuredPatch(raw.world, formData);
  if (!patchResult.ok) {
    return {
      ok: false,
      message: patchResult.message,
      issues: [],
    };
  }

  return saveValidatedWorldSource(
    worldId,
    stringify(raw.world, { lineWidth: 0 }),
    target,
    patchResult.message,
  );
}

function getEditableWorldTarget(worldId: string): EditableWorldTarget | null {
  if (
    !worldId ||
    !listWorldPackIds({ contentDir: CONTENT_DIR }).includes(worldId)
  ) {
    return null;
  }

  const worldsDir = resolve(CONTENT_DIR);
  const worldPackPath = resolve(
    resolveWorldPackPath(worldId, { contentDir: worldsDir }),
  );
  const sourcePath = resolve(
    resolveWorldPackFilePath(worldId, { contentDir: worldsDir }),
  );

  if (!worldPackPath.startsWith(`${worldsDir}${sep}`)) {
    return null;
  }

  return {
    sourcePath,
    worldPackPath,
  };
}

function saveValidatedWorldSource(
  worldId: string,
  source: string,
  target: EditableWorldTarget,
  successMessage: string,
): SaveWorldPackSourceState {
  const result = validateWorldPackSourceFromPath(
    target.worldPackPath,
    source,
    target.sourcePath,
  );

  if (!result.ok || !result.world) {
    return {
      ok: false,
      message: "Source did not pass validation. Nothing was written.",
      issues: result.issues,
    };
  }

  if (result.world.id !== worldId) {
    return {
      ok: false,
      message: `Source id must remain ${worldId}.`,
      issues: [
        {
          worldId,
          path: "id",
          message: `Expected ${worldId}, received ${result.world.id}`,
        },
      ],
    };
  }

  writeFileSync(
    target.sourcePath,
    source.endsWith("\n") ? source : `${source}\n`,
    "utf8",
  );
  revalidatePath("/");

  return {
    ok: true,
    message: successMessage,
    issues: [],
    savedAt: new Date().toISOString(),
  };
}

function parseEditableWorldSource(
  source: string,
  sourcePath: string,
): ParsedWorldSource {
  let raw: unknown;

  try {
    raw = parse(source);
  } catch (error) {
    return {
      error: failure(error instanceof Error ? error.message : String(error)),
    };
  }

  if (!isRecord(raw)) {
    return {
      error: failure(`World Pack source must contain an object: ${sourcePath}`),
    };
  }

  return {
    world: raw,
  };
}

function isRecord(value: unknown): value is StructuredRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failure(message: string): SaveWorldPackStructuredState {
  return {
    ok: false,
    message,
    issues: [],
  };
}
