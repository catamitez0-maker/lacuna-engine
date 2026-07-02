import { createObserverReport } from "@lacuna-engine/observer-archive";
import { runDailyPulse } from "@lacuna-engine/pulse-engine";
import {
  runtimeSessionSchema,
  type PlayerTimeline,
  type RuntimeSession,
  type RuntimeSessionStatus,
  type Trace,
} from "@lacuna-engine/schema";
import { DEFAULT_RUNTIME_SESSION_STATUS } from "./constants";
import { findById, findOptionalById, firstEntity } from "./entities";
import type {
  RuntimePulseResult,
  RuntimeSessionInput,
  RuntimeSessionPulseInput,
} from "./types";

export function createRuntimeSession({
  world,
  city,
  currentDayId = firstEntity(city.days, "City module has no days").id,
  timelineIds = [],
  sessionId = `${world.id}-${city.id}-${currentDayId}-session`,
  now = new Date().toISOString(),
}: RuntimeSessionInput): RuntimeSession {
  findById(city.days, currentDayId, "session day");

  return runtimeSessionSchema.parse({
    id: sessionId,
    worldId: world.id,
    cityId: city.id,
    currentDayId,
    timelineIds: uniqueIds(timelineIds),
    status: DEFAULT_RUNTIME_SESSION_STATUS,
    createdAt: now,
    updatedAt: now,
  });
}

export function addTimelineToRuntimeSession(
  session: RuntimeSession,
  timeline: PlayerTimeline,
  now = new Date().toISOString(),
): RuntimeSession {
  requireOpenRuntimeSession(session);

  if (
    timeline.worldId !== session.worldId ||
    timeline.cityId !== session.cityId
  ) {
    throw new Error(
      `Timeline ${timeline.id} does not belong to session ${session.id}`,
    );
  }

  return runtimeSessionSchema.parse({
    ...session,
    timelineIds: uniqueIds([...session.timelineIds, timeline.id]),
    updatedAt: now,
  });
}

export function pauseRuntimeSession(
  session: RuntimeSession,
  now = new Date().toISOString(),
): RuntimeSession {
  if (session.status !== "open") {
    throw new Error(
      `Only open sessions can be paused; received ${session.status}`,
    );
  }

  return updateRuntimeSessionStatus(session, "paused", now);
}

export function resumeRuntimeSession(
  session: RuntimeSession,
  now = new Date().toISOString(),
): RuntimeSession {
  if (session.status !== "paused") {
    throw new Error(
      `Only paused sessions can be resumed; received ${session.status}`,
    );
  }

  return updateRuntimeSessionStatus(session, "open", now);
}

export function settleRuntimeSession(
  session: RuntimeSession,
  now = new Date().toISOString(),
): RuntimeSession {
  requireOpenRuntimeSession(session);
  return updateRuntimeSessionStatus(session, "settled", now);
}

export function archiveRuntimeSession(
  session: RuntimeSession,
  now = new Date().toISOString(),
): RuntimeSession {
  return updateRuntimeSessionStatus(session, "archived", now);
}

export function collectRuntimeSessionTraces(
  session: RuntimeSession,
  traces: Trace[],
): Trace[] {
  const timelineIds = new Set(session.timelineIds);

  return traces.filter(
    (trace) =>
      trace.worldId === session.worldId &&
      trace.cityId === session.cityId &&
      trace.dayId === session.currentDayId &&
      timelineIds.has(trace.playerTimelineId),
  );
}

export function settleRuntimeSessionPulse({
  world,
  city,
  session,
  traces,
  now,
}: RuntimeSessionPulseInput): RuntimePulseResult {
  requireOpenRuntimeSession(session);

  const day = findById(city.days, session.currentDayId, "session day");
  const anchor = day.anchorId
    ? findOptionalById(city.anchors, day.anchorId)
    : undefined;
  const sessionTraces = collectRuntimeSessionTraces(session, traces);
  const { pulse, selectedVariants } = runDailyPulse({
    world,
    city,
    day,
    traces: sessionTraces,
    anchor,
    now,
    pulseId: `${session.id}-${day.id}-pulse`,
    observerReportId: `${session.id}-${day.id}-observer-report`,
  });
  const observerReport = createObserverReport({
    world,
    city,
    day,
    pulse,
    traces: sessionTraces,
    selectedVariants,
    now,
  });

  return {
    pulse,
    observerReport,
  };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function updateRuntimeSessionStatus(
  session: RuntimeSession,
  status: RuntimeSessionStatus,
  now: string,
): RuntimeSession {
  if (session.status === "archived" && status !== "archived") {
    throw new Error(
      `Archived session ${session.id} cannot transition to ${status}`,
    );
  }

  return runtimeSessionSchema.parse({
    ...session,
    status,
    updatedAt: now,
  });
}

function requireOpenRuntimeSession(session: RuntimeSession): void {
  if (session.status !== "open") {
    throw new Error(
      `Runtime session ${session.id} must be open; received ${session.status}`,
    );
  }
}
