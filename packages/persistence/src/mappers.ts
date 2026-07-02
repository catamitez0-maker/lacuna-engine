import {
  dailyPulseSchema,
  observerReportSchema,
  playerTimelineSchema,
  runtimeSessionSchema,
  traceSchema,
  type DailyPulse,
  type NumericState,
  type ObserverReport,
  type PlayerTimeline,
  type RuntimeSession,
  type Trace,
} from "@lacuna-engine/schema";
import { fromJson } from "./json";

export function mapTimeline(row: {
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
    unlockedArchiveIds: fromJson(row.unlockedArchiveIds),
  });
}

export function mapTrace(row: {
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
    createdAt: row.createdAt.toISOString(),
  });
}

export function mapPulse(row: {
  id: string;
  worldId: string;
  cityId: string;
  dayId: string;
  stateBeforeJson: string;
  traceIdsJson: string;
  stateAfterJson: string;
  selectedVariantIdsJson: string;
  ruleAuditJson: string;
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
    ruleAudit: fromJson(row.ruleAuditJson),
    observerReportId: row.observerReportId,
    createdAt: row.createdAt.toISOString(),
  });
}

export function mapReport(row: {
  id: string;
  worldId: string;
  cityId: string;
  dayId: string;
  title: string;
  summary: string;
  traceSummaryJson: string;
  stateDeltaSummaryJson: string;
  selectedVariantSummaryJson: string;
  ruleAuditSummaryJson: string;
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
    ruleAuditSummary: fromJson<string[]>(row.ruleAuditSummaryJson),
    createdAt: row.createdAt.toISOString(),
  });
}

export function mapSession(row: {
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
    updatedAt: row.updatedAt.toISOString(),
  });
}
