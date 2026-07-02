"use server";

import { join } from "node:path";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import {
  getPrismaClient,
  runPersistentFrameworkDemo,
  type PersistedRuntimeSnapshot,
} from "@lacuna-engine/persistence";

export type PersistedDemoActionResult =
  | {
      ok: true;
      snapshot: PersistedRuntimeSnapshot;
    }
  | {
      ok: false;
      error: string;
    };

const CONTENT_DIR = join(
  /* turbopackIgnore: true */ process.cwd(),
  "../../content/worlds",
);

export async function runPersistedFrameworkDemoAction(): Promise<PersistedDemoActionResult> {
  try {
    const world = loadEmptyWorldTemplate({ contentDir: CONTENT_DIR });
    const prisma = getPrismaClient();
    const snapshot = await runPersistentFrameworkDemo(prisma, world);

    return {
      ok: true,
      snapshot,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
