import type { PlayerTimeline } from "@lacuna-engine/schema";
import { fromJson, toJson } from "./json";
import { mapPulse, mapReport, mapTimeline, mapTrace } from "./mappers";
import type { LacunaPrismaClient, TimelineSnapshot } from "./types";

export async function savePlayer(
  prisma: LacunaPrismaClient,
  playerId: string,
  label?: string,
): Promise<void> {
  await prisma.player.upsert({
    where: { id: playerId },
    create: { id: playerId, label },
    update: { label },
  });
}

export async function savePlayerTimeline(
  prisma: LacunaPrismaClient,
  timeline: PlayerTimeline,
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
      unlockedArchiveIds: toJson(timeline.unlockedArchiveIds),
    },
    update: {
      roleId: timeline.roleId,
      currentDayId: timeline.currentDayId,
      currentSceneId: timeline.currentSceneId,
      personalFlagsJson: toJson(timeline.personalFlags),
      unlockedArchiveIds: toJson(timeline.unlockedArchiveIds),
    },
  });

  return mapTimeline(row);
}

export async function loadTimelineSnapshot(
  prisma: LacunaPrismaClient,
  timelineId: string,
): Promise<TimelineSnapshot | null> {
  const timeline = await prisma.playerTimeline.findUnique({
    where: { id: timelineId },
  });
  if (!timeline) {
    return null;
  }

  const traces = await prisma.trace.findMany({
    where: { playerTimelineId: timelineId },
    orderBy: { createdAt: "asc" },
  });
  const traceIds = new Set(traces.map((trace) => trace.id));
  const cityPulses =
    traceIds.size > 0
      ? await prisma.dailyPulse.findMany({
          where: { worldId: timeline.worldId, cityId: timeline.cityId },
          orderBy: { createdAt: "asc" },
        })
      : [];
  const pulses = cityPulses.filter((pulse) =>
    fromJson<string[]>(pulse.traceIdsJson).some((traceId) =>
      traceIds.has(traceId),
    ),
  );
  const reports =
    pulses.length > 0
      ? await prisma.observerReport.findMany({
          where: { pulseId: { in: pulses.map((pulse) => pulse.id) } },
          orderBy: { createdAt: "asc" },
        })
      : [];

  return {
    timeline: mapTimeline(timeline),
    traces: traces.map(mapTrace),
    pulses: pulses.map(mapPulse),
    reports: reports.map(mapReport),
  };
}

export async function loadRequiredTimeline(
  prisma: LacunaPrismaClient,
  timelineId: string | undefined,
): Promise<PlayerTimeline> {
  if (!timelineId) {
    throw new Error("Runtime session has no timelines");
  }

  const row = await prisma.playerTimeline.findUnique({
    where: { id: timelineId },
  });
  if (!row) {
    throw new Error(`Missing persisted timeline ${timelineId}`);
  }

  return mapTimeline(row);
}
