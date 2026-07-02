import {
  createRuntimeSession,
  runFrameworkDemo,
} from "@lacuna-engine/narrative-runtime";
import type { WorldPack } from "@lacuna-engine/schema";
import {
  saveDailyPulse,
  saveObserverReport,
  savePlayerTimeline,
  saveRuntimeSession,
  saveTrace,
  seedWorldPack,
} from "./repositories";
import type { LacunaPrismaClient, PersistedRuntimeSnapshot } from "./types";

export async function runPersistentFrameworkDemo(
  prisma: LacunaPrismaClient,
  world: WorldPack,
): Promise<PersistedRuntimeSnapshot> {
  await seedWorldPack(prisma, world);

  const result = runFrameworkDemo(world);
  const session = createRuntimeSession({
    world,
    city: result.city,
    currentDayId: result.timeline.currentDayId,
    timelineIds: [result.timeline.id],
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
    result.pulse.id,
  );

  return {
    worldId: world.id,
    cityId: result.city.id,
    timeline: result.timeline,
    traces,
    pulse,
    observerReport,
    session,
  };
}
