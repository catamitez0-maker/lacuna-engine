import type {
  DailyPulse,
  ObserverReport,
  PlayerTimeline,
  RuntimeSession,
  Trace,
} from "@lacuna-engine/schema";
import type { PrismaClient as PrismaClientType } from "@prisma/client";

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

export type RuntimeSessionSnapshot = {
  session: RuntimeSession;
  timelines: PlayerTimeline[];
  traces: Trace[];
  pulses: DailyPulse[];
  reports: ObserverReport[];
};
