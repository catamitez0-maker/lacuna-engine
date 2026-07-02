import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import {
  createPrismaClient,
  loadRuntimeSessionSnapshot,
  loadTimelineSnapshot,
  pausePersistentRuntimeSession,
  resumePersistentRuntimeSession,
  runPersistentFrameworkDemo,
  type LacunaPrismaClient,
} from "@lacuna-engine/persistence";

let prisma: LacunaPrismaClient;

describe("Prisma persistence", () => {
  beforeAll(() => {
    const dbDir = mkdtempSync(join(tmpdir(), "lacuna-db-"));
    const databaseUrl = `file:${join(dbDir, "test.db")}`;

    execFileSync("corepack", ["pnpm", "prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: "pipe",
    });

    prisma = createPrismaClient({ databaseUrl });
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it("persists a complete framework demo snapshot", async () => {
    const world = loadEmptyWorldTemplate({
      contentDir: join(process.cwd(), "content/worlds"),
    });
    const snapshot = await runPersistentFrameworkDemo(prisma, world);

    await expect(prisma.world.count()).resolves.toBe(1);
    await expect(prisma.city.count()).resolves.toBe(1);
    await expect(prisma.playerTimeline.count()).resolves.toBe(1);
    await expect(prisma.trace.count()).resolves.toBe(1);
    await expect(prisma.dailyPulse.count()).resolves.toBe(1);
    await expect(prisma.observerReport.count()).resolves.toBe(1);
    await expect(prisma.runtimeSession.count()).resolves.toBe(1);

    const persistedWorld = await prisma.world.findUnique({
      where: { id: world.id },
    });

    expect(persistedWorld).toMatchObject({
      schemaVersion: "0.1.0",
    });
    expect(JSON.parse(persistedWorld!.constantsJson)).toEqual(world.constants);
    expect(JSON.parse(persistedWorld!.stateRulesJson)).toEqual(
      world.stateRules,
    );
    expect(JSON.parse(persistedWorld!.spineJson!)).toEqual(world.spine);
    expect(snapshot.session?.timelineIds).toEqual([snapshot.timeline.id]);
    expect(snapshot.pulse.traceIds).toEqual(
      snapshot.traces.map((trace) => trace.id),
    );
    expect(snapshot.pulse.ruleAudit).toHaveLength(1);
    expect(snapshot.observerReport.traceSummary).toHaveLength(1);
    expect(snapshot.observerReport.ruleAuditSummary).toHaveLength(1);
  });

  it("loads timeline pulses by trace id", async () => {
    const world = loadEmptyWorldTemplate({
      contentDir: join(process.cwd(), "content/worlds"),
    });
    const snapshot = await runPersistentFrameworkDemo(prisma, world);

    await expect(
      loadTimelineSnapshot(prisma, snapshot.timeline.id),
    ).resolves.toMatchObject({
      timeline: { id: snapshot.timeline.id },
      traces: [{ id: snapshot.traces[0]!.id }],
      pulses: [{ id: snapshot.pulse.id }],
      reports: [{ id: snapshot.observerReport.id }],
    });
  });

  it("loads, pauses, and resumes a persisted runtime session", async () => {
    const world = loadEmptyWorldTemplate({
      contentDir: join(process.cwd(), "content/worlds"),
    });
    const snapshot = await runPersistentFrameworkDemo(prisma, world);
    const sessionId = snapshot.session!.id;

    await expect(
      loadRuntimeSessionSnapshot(prisma, sessionId),
    ).resolves.toMatchObject({
      session: { id: sessionId },
      timelines: [{ id: snapshot.timeline.id }],
      traces: [{ id: snapshot.traces[0]!.id }],
      pulses: [{ id: snapshot.pulse.id }],
      reports: [{ id: snapshot.observerReport.id }],
    });

    await expect(
      pausePersistentRuntimeSession(
        prisma,
        sessionId,
        "2026-01-01T01:00:00.000Z",
      ),
    ).resolves.toMatchObject({ status: "paused" });
    await expect(
      resumePersistentRuntimeSession(
        prisma,
        sessionId,
        "2026-01-01T02:00:00.000Z",
      ),
    ).resolves.toMatchObject({ status: "open" });
  });
});
