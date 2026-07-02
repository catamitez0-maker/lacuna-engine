import type { PrologueRecord } from "@lacuna-engine/identity-mapper";
import type {
  CityModule,
  DailyPulse,
  IdentityFragment,
  ObserverReport,
  PlaceholderAction,
  PlayerTimeline,
  PrologueAction,
  RuntimeSession,
  Scene,
  Trace,
  WorldPack,
} from "@lacuna-engine/schema";

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
