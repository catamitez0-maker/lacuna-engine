import {
  generateIdentityFragments,
  recordPrologueAction,
  summarizePrologueTendency,
  type PrologueRecord
} from "@lacuna-engine/identity-mapper";
import { createObserverReport } from "@lacuna-engine/observer-archive";
import { runDailyPulse } from "@lacuna-engine/pulse-engine";
import {
  playerTimelineSchema,
  runtimeSessionSchema,
  type CityModule,
  type DailyPulse,
  type IdentityFragment,
  type ObserverReport,
  type PlaceholderAction,
  type PlayerTimeline,
  type PrologueAction,
  type RuntimeSession,
  type Scene,
  type StoryDay,
  type Trace,
  type WorldPack
} from "@lacuna-engine/schema";
import { createTraceFromAction } from "@lacuna-engine/trace-ledger";

export const DEFAULT_DEMO_PLAYER_ID = "demo-player";
export const FRAMEWORK_DEMO_TIMESTAMP = "2026-01-01T00:00:00.000Z";
export const DEFAULT_RUNTIME_SESSION_STATUS = "open";

export type TimelineInput = {
  world: WorldPack;
  city: CityModule;
  fragment: IdentityFragment;
  prologueRecords?: PrologueRecord[];
  playerId?: string;
};

export type RuntimeActionInput = {
  city: CityModule;
  timeline: PlayerTimeline;
  actionId: string;
  now?: string;
  sequence?: number;
};

export type RuntimePulseInput = {
  world: WorldPack;
  city: CityModule;
  timeline: PlayerTimeline;
  traces: Trace[];
  now?: string;
};

export type RuntimePulseResult = {
  pulse: DailyPulse;
  observerReport: ObserverReport;
};

export type RuntimeSessionInput = {
  world: WorldPack;
  city: CityModule;
  currentDayId?: string;
  timelineIds?: string[];
  sessionId?: string;
  now?: string;
};

export type RuntimeSessionPulseInput = {
  world: WorldPack;
  city: CityModule;
  session: RuntimeSession;
  traces: Trace[];
  now?: string;
};

export type FrameworkDemoResult = {
  world: WorldPack;
  city: CityModule;
  prologueAction: PrologueAction;
  fragments: IdentityFragment[];
  selectedFragment: IdentityFragment;
  timeline: PlayerTimeline;
  scene: Scene;
  action: PlaceholderAction;
  traces: Trace[];
  pulse: DailyPulse;
  observerReport: ObserverReport;
};

export function getPrimaryCity(world: WorldPack): CityModule {
  return firstEntity(world.cities, "World Pack has no city modules");
}

export function getEntryScene(city: CityModule, timeline: PlayerTimeline): Scene {
  return findById(city.scenes, timeline.currentSceneId, "scene");
}

export function getCurrentDay(
  city: CityModule,
  timeline: PlayerTimeline
): StoryDay {
  return findById(city.days, timeline.currentDayId, "day");
}

export function selectPrologueAction(
  city: CityModule,
  actionId: string
): PrologueRecord {
  return recordPrologueAction(city, actionId);
}

export function listIdentityFragments(
  city: CityModule,
  records: PrologueRecord[] = []
): IdentityFragment[] {
  return generateIdentityFragments(city, records);
}

export function createPlayerTimelineFromFragment({
  world,
  city,
  fragment,
  prologueRecords = [],
  playerId = DEFAULT_DEMO_PLAYER_ID
}: TimelineInput): PlayerTimeline {
  const role = findById(city.entryRoles, fragment.mappedRoleId, "mapped role");

  findById(city.days, role.entryDayId, "entry day");
  findById(city.scenes, role.entrySceneId, "entry scene");

  return playerTimelineSchema.parse({
    id: createTimelineId(world, city, fragment),
    playerId,
    worldId: world.id,
    cityId: city.id,
    roleId: role.id,
    currentDayId: role.entryDayId,
    currentSceneId: role.entrySceneId,
    personalFlags: {
      selectedFragmentId: fragment.id,
      entryTendency: summarizePrologueTendency(prologueRecords)
    },
    unlockedArchiveIds: []
  });
}

export function performRuntimeAction({
  city,
  timeline,
  actionId,
  now,
  sequence
}: RuntimeActionInput): Trace {
  const action = findById(city.placeholderActions, actionId, "placeholder action");

  return createTraceFromAction({
    timeline,
    action,
    now,
    sequence
  });
}

export function settleRuntimePulse({
  world,
  city,
  timeline,
  traces,
  now
}: RuntimePulseInput): RuntimePulseResult {
  const day = getCurrentDay(city, timeline);
  const anchor = day.anchorId ? findOptionalById(city.anchors, day.anchorId) : undefined;
  const observerReportId = createObserverReportId(timeline, day);
  const { pulse, selectedVariants } = runDailyPulse({
    world,
    city,
    day,
    traces,
    anchor,
    now,
    pulseId: createPulseId(timeline, day),
    observerReportId
  });
  const observerReport = createObserverReport({
    world,
    city,
    day,
    pulse,
    traces,
    selectedVariants,
    now
  });

  return {
    pulse,
    observerReport
  };
}

export function createRuntimeSession({
  world,
  city,
  currentDayId = firstEntity(city.days, "City module has no days").id,
  timelineIds = [],
  sessionId = `${world.id}-${city.id}-${currentDayId}-session`,
  now = new Date().toISOString()
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
    updatedAt: now
  });
}

export function addTimelineToRuntimeSession(
  session: RuntimeSession,
  timeline: PlayerTimeline,
  now = new Date().toISOString()
): RuntimeSession {
  if (timeline.worldId !== session.worldId || timeline.cityId !== session.cityId) {
    throw new Error(`Timeline ${timeline.id} does not belong to session ${session.id}`);
  }

  return runtimeSessionSchema.parse({
    ...session,
    timelineIds: uniqueIds([...session.timelineIds, timeline.id]),
    updatedAt: now
  });
}

export function collectRuntimeSessionTraces(
  session: RuntimeSession,
  traces: Trace[]
): Trace[] {
  const timelineIds = new Set(session.timelineIds);

  return traces.filter(
    (trace) =>
      trace.worldId === session.worldId &&
      trace.cityId === session.cityId &&
      trace.dayId === session.currentDayId &&
      timelineIds.has(trace.playerTimelineId)
  );
}

export function settleRuntimeSessionPulse({
  world,
  city,
  session,
  traces,
  now
}: RuntimeSessionPulseInput): RuntimePulseResult {
  const day = findById(city.days, session.currentDayId, "session day");
  const anchor = day.anchorId ? findOptionalById(city.anchors, day.anchorId) : undefined;
  const sessionTraces = collectRuntimeSessionTraces(session, traces);
  const { pulse, selectedVariants } = runDailyPulse({
    world,
    city,
    day,
    traces: sessionTraces,
    anchor,
    now,
    pulseId: `${session.id}-${day.id}-pulse`,
    observerReportId: `${session.id}-${day.id}-observer-report`
  });
  const observerReport = createObserverReport({
    world,
    city,
    day,
    pulse,
    traces: sessionTraces,
    selectedVariants,
    now
  });

  return {
    pulse,
    observerReport
  };
}

export function runFrameworkDemo(world: WorldPack): FrameworkDemoResult {
  const city = getPrimaryCity(world);
  const prologueAction = firstEntity(
    city.prologueActions,
    "City module has no prologue actions"
  );
  const prologueRecord = selectPrologueAction(city, prologueAction.id);
  const fragments = listIdentityFragments(city, [prologueRecord]);
  const selectedFragment = firstEntity(
    fragments,
    "Identity mapper returned no fragments"
  );
  const timeline = createPlayerTimelineFromFragment({
    world,
    city,
    fragment: selectedFragment,
    prologueRecords: [prologueRecord]
  });
  const scene = getEntryScene(city, timeline);
  const action = firstEntity(
    city.placeholderActions,
    "City module has no placeholder actions"
  );
  const trace = performRuntimeAction({
    city,
    timeline,
    actionId: action.id,
    now: FRAMEWORK_DEMO_TIMESTAMP
  });
  const { pulse, observerReport } = settleRuntimePulse({
    world,
    city,
    timeline,
    traces: [trace],
    now: FRAMEWORK_DEMO_TIMESTAMP
  });

  return {
    world,
    city,
    prologueAction,
    fragments,
    selectedFragment,
    timeline,
    scene,
    action,
    traces: [trace],
    pulse,
    observerReport
  };
}

export function createTimelineId(
  world: Pick<WorldPack, "id">,
  city: Pick<CityModule, "id">,
  fragment: Pick<IdentityFragment, "id">
): string {
  return `${world.id}-${city.id}-${fragment.id}-timeline`;
}

export function createPulseId(
  timeline: Pick<PlayerTimeline, "id">,
  day: Pick<StoryDay, "id">
): string {
  return `${timeline.id}-${day.id}-pulse`;
}

export function createObserverReportId(
  timeline: Pick<PlayerTimeline, "id">,
  day: Pick<StoryDay, "id">
): string {
  return `${timeline.id}-${day.id}-observer-report`;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function firstEntity<T>(items: readonly T[], message: string): T {
  const [first] = items;

  if (!first) {
    throw new Error(message);
  }

  return first;
}

function findById<T extends { id: string }>(
  items: readonly T[],
  id: string,
  label: string
): T {
  const entity = findOptionalById(items, id);

  if (!entity) {
    throw new Error(`Missing ${label} ${id}`);
  }

  return entity;
}

function findOptionalById<T extends { id: string }>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find((candidate) => candidate.id === id);
}
