import { createRequire } from "node:module";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  createRuntimeSession,
  runFrameworkDemo,
  settleRuntimeSessionPulse
} from "@lacuna-engine/narrative-runtime";
import {
  dailyPulseSchema,
  observerReportSchema,
  playerTimelineSchema,
  runtimeSessionSchema,
  traceSchema,
  type CityModule,
  type DailyPulse,
  type NumericState,
  type ObserverReport,
  type PlayerTimeline,
  type RuntimeSession,
  type Trace,
  type WorldPack
} from "@lacuna-engine/schema";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");

export type LacunaPrismaClient = PrismaClientType;

export type PersistenceOptions = {
  databaseUrl?: string;
};

export type PersistedRuntimeSnapshot = {
  worldId: string;
  cityId: string;
  timeline: PlayerTimeline;
  traces: Trace[];
  pulse: DailyPulse;
  observerReport: ObserverReport;
  session?: RuntimeSession;
};

export type TimelineSnapshot = {
  timeline: PlayerTimeline;
  traces: Trace[];
  pulses: DailyPulse[];
  reports: ObserverReport[];
};

declare global {
  // eslint-disable-next-line no-var
  var __lacunaPrisma: LacunaPrismaClient | undefined;
}

export function createPrismaClient({
  databaseUrl = process.env["DATABASE_URL"] ?? "file:./dev.db"
}: PersistenceOptions = {}): LacunaPrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

export function getPrismaClient(options: PersistenceOptions = {}): LacunaPrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient(options);
  }

  globalThis.__lacunaPrisma ??= createPrismaClient(options);
  return globalThis.__lacunaPrisma;
}

export async function seedWorldPack(
  prisma: LacunaPrismaClient,
  world: WorldPack
): Promise<void> {
  await prisma.world.upsert({
    where: { id: world.id },
    create: {
      id: world.id,
      name: world.name,
      version: world.version,
      description: world.description,
      enabled: world.enabled
    },
    update: {
      name: world.name,
      version: world.version,
      description: world.description,
      enabled: world.enabled
    }
  });

  for (const city of world.cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      create: {
        id: city.id,
        worldId: world.id,
        name: city.name,
        description: city.description,
        stateSchemaJson: toJson(city.stateSchema),
        initialStateJson: toJson(city.initialState)
      },
      update: {
        worldId: world.id,
        name: city.name,
        description: city.description,
        stateSchemaJson: toJson(city.stateSchema),
        initialStateJson: toJson(city.initialState)
      }
    });
  }
}

export async function savePlayer(
  prisma: LacunaPrismaClient,
  playerId: string,
  label?: string
): Promise<void> {
  await prisma.player.upsert({
    where: { id: playerId },
    create: { id: playerId, label },
    update: { label }
  });
}

export async function savePlayerTimeline(
  prisma: LacunaPrismaClient,
  timeline: PlayerTimeline
): Promise<PlayerTimeline> {
  await savePlayer(prisma, timeline.playerId);

  const row = await prisma.playerTimeline.upsert({
    where: { id: timeline.id },
    create: {
      id: timeline.id,
      playerId: timeline.playerId,
      worldId: timeline.worldId,
      cityId: timeline.cityId,
      roleId: timeline.roleId,
      currentDayId: timeline.currentDayId,
      currentSceneId: timeline.currentSceneId,
      personalFlagsJson: toJson(timeline.personalFlags),
      unlockedArchiveIds: toJson(timeline.unlockedArchiveIds)
    },
    update: {
      roleId: timeline.roleId,
      currentDayId: timeline.currentDayId,
      currentSceneId: timeline.currentSceneId,
      personalFlagsJson: toJson(timeline.personalFlags),
      unlockedArchiveIds: toJson(timeline.unlockedArchiveIds)
    }
  });

  return mapTimeline(row);
}

export async function saveTrace(
  prisma: LacunaPrismaClient,
  trace: Trace,
  sessionId?: string
): Promise<Trace> {
  const row = await prisma.trace.upsert({
    where: { id: trace.id },
    create: {
      id: trace.id,
      sessionId,
      playerTimelineId: trace.playerTimelineId,
      worldId: trace.worldId,
      cityId: trace.cityId,
      dayId: trace.dayId,
      type: trace.type,
      visibility: trace.visibility,
      weight: trace.weight,
      effectsJson: toJson(trace.effects),
      createdAt: new Date(trace.createdAt)
    },
    update: {
      sessionId,
      type: trace.type,
      visibility: trace.visibility,
      weight: trace.weight,
      effectsJson: toJson(trace.effects)
    }
  });

  return mapTrace(row);
}

export async function saveDailyPulse(
  prisma: LacunaPrismaClient,
  pulse: DailyPulse,
  sessionId?: string
): Promise<DailyPulse> {
  const row = await prisma.dailyPulse.upsert({
    where: { id: pulse.id },
    create: {
      id: pulse.id,
      sessionId,
      worldId: pulse.worldId,
      cityId: pulse.cityId,
      dayId: pulse.dayId,
      stateBeforeJson: toJson(pulse.stateBefore),
      traceIdsJson: toJson(pulse.traceIds),
      stateAfterJson: toJson(pulse.stateAfter),
      selectedVariantIdsJson: toJson(pulse.selectedVariantIds),
      observerReportId: pulse.observerReportId,
      createdAt: new Date(pulse.createdAt)
    },
    update: {
      sessionId,
      stateBeforeJson: toJson(pulse.stateBefore),
      traceIdsJson: toJson(pulse.traceIds),
      stateAfterJson: toJson(pulse.stateAfter),
      selectedVariantIdsJson: toJson(pulse.selectedVariantIds),
      observerReportId: pulse.observerReportId
    }
  });

  return mapPulse(row);
}

export async function saveObserverReport(
  prisma: LacunaPrismaClient,
  report: ObserverReport,
  pulseId?: string
): Promise<ObserverReport> {
  const row = await prisma.observerReport.upsert({
    where: { id: report.id },
    create: {
      id: report.id,
      worldId: report.worldId,
      cityId: report.cityId,
      dayId: report.dayId,
      pulseId,
      title: report.title,
      summary: report.summary,
      traceSummaryJson: toJson(report.traceSummary),
      stateDeltaSummaryJson: toJson(report.stateDeltaSummary),
      selectedVariantSummaryJson: toJson(report.selectedVariantSummary),
      createdAt: new Date(report.createdAt)
    },
    update: {
      pulseId,
      title: report.title,
      summary: report.summary,
      traceSummaryJson: toJson(report.traceSummary),
      stateDeltaSummaryJson: toJson(report.stateDeltaSummary),
      selectedVariantSummaryJson: toJson(report.selectedVariantSummary)
    }
  });

  return mapReport(row);
}

export async function saveRuntimeSession(
  prisma: LacunaPrismaClient,
  session: RuntimeSession
): Promise<RuntimeSession> {
  const row = await prisma.runtimeSession.upsert({
    where: { id: session.id },
    create: {
      id: session.id,
      worldId: session.worldId,
      cityId: session.cityId,
      currentDayId: session.currentDayId,
      timelineIdsJson: toJson(session.timelineIds),
      status: session.status,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt)
    },
    update: {
      currentDayId: session.currentDayId,
      timelineIdsJson: toJson(session.timelineIds),
      status: session.status
    }
  });

  return mapSession(row);
}

export async function loadRuntimeSession(
  prisma: LacunaPrismaClient,
  sessionId: string
): Promise<RuntimeSession | null> {
  const row = await prisma.runtimeSession.findUnique({ where: { id: sessionId } });
  return row ? mapSession(row) : null;
}

export async function listSessionTraces(
  prisma: LacunaPrismaClient,
  session: RuntimeSession
): Promise<Trace[]> {
  const rows = await prisma.trace.findMany({
    where: {
      worldId: session.worldId,
      cityId: session.cityId,
      dayId: session.currentDayId,
      playerTimelineId: { in: session.timelineIds }
    },
    orderBy: { createdAt: "asc" }
  });

  return rows.map(mapTrace);
}

export async function loadTimelineSnapshot(
  prisma: LacunaPrismaClient,
  timelineId: string
): Promise<TimelineSnapshot | null> {
  const timeline = await prisma.playerTimeline.findUnique({ where: { id: timelineId } });
  if (!timeline) {
    return null;
  }

  const [traces, pulses, reports] = await Promise.all([
    prisma.trace.findMany({ where: { playerTimelineId: timelineId }, orderBy: { createdAt: "asc" } }),
    prisma.dailyPulse.findMany({ where: { traceIdsJson: { contains: timelineId } } }),
    prisma.observerReport.findMany({ where: { worldId: timeline.worldId, cityId: timeline.cityId } })
  ]);

  return {
    timeline: mapTimeline(timeline),
    traces: traces.map(mapTrace),
    pulses: pulses.map(mapPulse),
    reports: reports.map(mapReport)
  };
}

export async function runPersistentFrameworkDemo(
  prisma: LacunaPrismaClient,
  world: WorldPack
): Promise<PersistedRuntimeSnapshot> {
  await seedWorldPack(prisma, world);

  const result = runFrameworkDemo(world);
  const session = createRuntimeSession({
    world,
    city: result.city,
    currentDayId: result.timeline.currentDayId,
    timelineIds: [result.timeline.id]
  });

  await savePlayerTimeline(prisma, result.timeline);
  await saveRuntimeSession(prisma, session);

  const traces = [];
  for (const trace of result.traces) {
    traces.push(await saveTrace(prisma, trace, session.id));
  }

  const pulse = await saveDailyPulse(prisma, result.pulse, session.id);
  const observerReport = await saveObserverReport(
    prisma,
    result.observerReport,
    result.pulse.id
  );

  return {
    worldId: world.id,
    cityId: result.city.id,
    timeline: result.timeline,
    traces,
    pulse,
    observerReport,
    session
  };
}

export async function settlePersistentSessionPulse({
  prisma,
  world,
  city,
  session,
  now
}: {
  prisma: LacunaPrismaClient;
  world: WorldPack;
  city: CityModule;
  session: RuntimeSession;
  now?: string;
}): Promise<PersistedRuntimeSnapshot> {
  const traces = await listSessionTraces(prisma, session);
  const { pulse, observerReport } = settleRuntimeSessionPulse({
    world,
    city,
    session,
    traces,
    now
  });
  const savedPulse = await saveDailyPulse(prisma, pulse, session.id);
  const savedReport = await saveObserverReport(prisma, observerReport, pulse.id);
  const settledSession = await saveRuntimeSession(prisma, {
    ...session,
    status: "settled",
    updatedAt: now ?? new Date().toISOString()
  });

  return {
    worldId: world.id,
    cityId: city.id,
    timeline: await loadRequiredTimeline(prisma, session.timelineIds[0]),
    traces,
    pulse: savedPulse,
    observerReport: savedReport,
    session: settledSession
  };
}

async function loadRequiredTimeline(
  prisma: LacunaPrismaClient,
  timelineId: string | undefined
): Promise<PlayerTimeline> {
  if (!timelineId) {
    throw new Error("Runtime session has no timelines");
  }

  const row = await prisma.playerTimeline.findUnique({ where: { id: timelineId } });
  if (!row) {
    throw new Error(`Missing persisted timeline ${timelineId}`);
  }

  return mapTimeline(row);
}

function mapTimeline(row: {
  id: string;
  playerId: string;
  worldId: string;
  cityId: string;
  roleId: string;
  currentDayId: string;
  currentSceneId: string;
  personalFlagsJson: string;
  unlockedArchiveIds: string;
}): PlayerTimeline {
  return playerTimelineSchema.parse({
    id: row.id,
    playerId: row.playerId,
    worldId: row.worldId,
    cityId: row.cityId,
    roleId: row.roleId,
    currentDayId: row.currentDayId,
    currentSceneId: row.currentSceneId,
    personalFlags: fromJson(row.personalFlagsJson),
    unlockedArchiveIds: fromJson(row.unlockedArchiveIds)
  });
}

function mapTrace(row: {
  id: string;
  playerTimelineId: string;
  worldId: string;
  cityId: string;
  dayId: string;
  type: string;
  visibility: string;
  weight: number;
  effectsJson: string;
  createdAt: Date;
}): Trace {
  return traceSchema.parse({
    id: row.id,
    playerTimelineId: row.playerTimelineId,
    worldId: row.worldId,
    cityId: row.cityId,
    dayId: row.dayId,
    type: row.type,
    visibility: row.visibility,
    weight: row.weight,
    effects: fromJson<NumericState>(row.effectsJson),
    createdAt: row.createdAt.toISOString()
  });
}

function mapPulse(row: {
  id: string;
  worldId: string;
  cityId: string;
  dayId: string;
  stateBeforeJson: string;
  traceIdsJson: string;
  stateAfterJson: string;
  selectedVariantIdsJson: string;
  observerReportId: string;
  createdAt: Date;
}): DailyPulse {
  return dailyPulseSchema.parse({
    id: row.id,
    worldId: row.worldId,
    cityId: row.cityId,
    dayId: row.dayId,
    stateBefore: fromJson<NumericState>(row.stateBeforeJson),
    traceIds: fromJson<string[]>(row.traceIdsJson),
    stateAfter: fromJson<NumericState>(row.stateAfterJson),
    selectedVariantIds: fromJson<string[]>(row.selectedVariantIdsJson),
    observerReportId: row.observerReportId,
    createdAt: row.createdAt.toISOString()
  });
}

function mapReport(row: {
  id: string;
  worldId: string;
  cityId: string;
  dayId: string;
  title: string;
  summary: string;
  traceSummaryJson: string;
  stateDeltaSummaryJson: string;
  selectedVariantSummaryJson: string;
  createdAt: Date;
}): ObserverReport {
  return observerReportSchema.parse({
    id: row.id,
    worldId: row.worldId,
    cityId: row.cityId,
    dayId: row.dayId,
    title: row.title,
    summary: row.summary,
    traceSummary: fromJson<string[]>(row.traceSummaryJson),
    stateDeltaSummary: fromJson<string[]>(row.stateDeltaSummaryJson),
    selectedVariantSummary: fromJson<string[]>(row.selectedVariantSummaryJson),
    createdAt: row.createdAt.toISOString()
  });
}

function mapSession(row: {
  id: string;
  worldId: string;
  cityId: string;
  currentDayId: string;
  timelineIdsJson: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): RuntimeSession {
  return runtimeSessionSchema.parse({
    id: row.id,
    worldId: row.worldId,
    cityId: row.cityId,
    currentDayId: row.currentDayId,
    timelineIds: fromJson<string[]>(row.timelineIdsJson),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  });
}

function toJson(value: unknown): string {
  return JSON.stringify(value);
}

function fromJson<T = unknown>(value: string): T {
  return JSON.parse(value) as T;
}
