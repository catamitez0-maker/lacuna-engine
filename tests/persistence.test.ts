import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader";
import {
  createPrismaClient,
  runPersistentFrameworkDemo,
  type LacunaPrismaClient
} from "@lacuna-engine/persistence";

let prisma: LacunaPrismaClient;

describe("Prisma persistence", () => {
  beforeAll(() => {
    const dbDir = mkdtempSync(join(tmpdir(), "lacuna-db-"));
    const databaseUrl = `file:${join(dbDir, "test.db")}`;

    execFileSync("corepack", ["pnpm", "prisma", "db", "push", "--url", databaseUrl], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      },
      stdio: "pipe"
    });

    prisma = createPrismaClient({ databaseUrl });
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it("persists a complete framework demo snapshot", async () => {
    const world = loadEmptyWorldTemplate();
    const snapshot = await runPersistentFrameworkDemo(prisma, world);

    await expect(prisma.world.count()).resolves.toBe(1);
    await expect(prisma.city.count()).resolves.toBe(1);
    await expect(prisma.playerTimeline.count()).resolves.toBe(1);
    await expect(prisma.trace.count()).resolves.toBe(1);
    await expect(prisma.dailyPulse.count()).resolves.toBe(1);
    await expect(prisma.observerReport.count()).resolves.toBe(1);
    await expect(prisma.runtimeSession.count()).resolves.toBe(1);

    expect(snapshot.session?.timelineIds).toEqual([snapshot.timeline.id]);
    expect(snapshot.pulse.traceIds).toEqual(snapshot.traces.map((trace) => trace.id));
    expect(snapshot.observerReport.traceSummary).toHaveLength(1);
  });
});
