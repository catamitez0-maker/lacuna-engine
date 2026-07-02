import {
  archiveRuntimeSession,
  pauseRuntimeSession,
  resumeRuntimeSession,
  settleRuntimeSession,
  settleRuntimeSessionPulse,
} from "@lacuna-engine/narrative-runtime";
import type {
  CityModule,
  RuntimeSession,
  WorldPack,
} from "@lacuna-engine/schema";
import {
  listSessionTraces,
  saveDailyPulse,
  saveObserverReport,
} from "./event-repository";
import {
  mapPulse,
  mapReport,
  mapSession,
  mapTimeline,
  mapTrace,
} from "./mappers";
import { loadRequiredTimeline } from "./timeline-repository";
import { toJson } from "./json";
import type {
  LacunaPrismaClient,
  PersistedRuntimeSnapshot,
  RuntimeSessionSnapshot,
} from "./types";

export async function saveRuntimeSession(
  prisma: LacunaPrismaClient,
  session: RuntimeSession,
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
      updatedAt: new Date(session.updatedAt),
    },
    update: {
      currentDayId: session.currentDayId,
      timelineIdsJson: toJson(session.timelineIds),
      status: session.status,
      updatedAt: new Date(session.updatedAt),
    },
  });

  return mapSession(row);
}

export async function loadRuntimeSession(
  prisma: LacunaPrismaClient,
  sessionId: string,
): Promise<RuntimeSession | null> {
  const row = await prisma.runtimeSession.findUnique({
    where: { id: sessionId },
  });
  return row ? mapSession(row) : null;
}

export async function loadRuntimeSessionSnapshot(
  prisma: LacunaPrismaClient,
  sessionId: string,
): Promise<RuntimeSessionSnapshot | null> {
  const session = await loadRuntimeSession(prisma, sessionId);
  if (!session) {
    return null;
  }

  const [timelineRows, traceRows, pulseRows] = await Promise.all([
    prisma.playerTimeline.findMany({
      where: { id: { in: session.timelineIds } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.trace.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dailyPulse.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const reports = pulseRows.length
    ? await prisma.observerReport.findMany({
        where: { pulseId: { in: pulseRows.map((pulse) => pulse.id) } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return {
    session,
    timelines: timelineRows.map(mapTimeline),
    traces: traceRows.map(mapTrace),
    pulses: pulseRows.map(mapPulse),
    reports: reports.map(mapReport),
  };
}

export async function pausePersistentRuntimeSession(
  prisma: LacunaPrismaClient,
  sessionId: string,
  now = new Date().toISOString(),
): Promise<RuntimeSession> {
  return saveRuntimeSession(
    prisma,
    pauseRuntimeSession(await loadRequiredSession(prisma, sessionId), now),
  );
}

export async function resumePersistentRuntimeSession(
  prisma: LacunaPrismaClient,
  sessionId: string,
  now = new Date().toISOString(),
): Promise<RuntimeSession> {
  return saveRuntimeSession(
    prisma,
    resumeRuntimeSession(await loadRequiredSession(prisma, sessionId), now),
  );
}

export async function archivePersistentRuntimeSession(
  prisma: LacunaPrismaClient,
  sessionId: string,
  now = new Date().toISOString(),
): Promise<RuntimeSession> {
  return saveRuntimeSession(
    prisma,
    archiveRuntimeSession(await loadRequiredSession(prisma, sessionId), now),
  );
}

export async function settlePersistentSessionPulse({
  prisma,
  world,
  city,
  session,
  now,
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
    now,
  });
  const savedPulse = await saveDailyPulse(prisma, pulse, session.id);
  const savedReport = await saveObserverReport(
    prisma,
    observerReport,
    pulse.id,
  );
  const settledSession = await saveRuntimeSession(
    prisma,
    settleRuntimeSession(session, now ?? new Date().toISOString()),
  );

  return {
    worldId: world.id,
    cityId: city.id,
    timeline: await loadRequiredTimeline(prisma, session.timelineIds[0]),
    traces,
    pulse: savedPulse,
    observerReport: savedReport,
    session: settledSession,
  };
}

async function loadRequiredSession(
  prisma: LacunaPrismaClient,
  sessionId: string,
): Promise<RuntimeSession> {
  const session = await loadRuntimeSession(prisma, sessionId);
  if (!session) {
    throw new Error(`Missing persisted session ${sessionId}`);
  }

  return session;
}
