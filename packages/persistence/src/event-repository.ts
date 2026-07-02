import type {
  DailyPulse,
  ObserverReport,
  RuntimeSession,
  Trace,
} from "@lacuna-engine/schema";
import { toJson } from "./json";
import { mapPulse, mapReport, mapTrace } from "./mappers";
import type { LacunaPrismaClient } from "./types";

export async function saveTrace(
  prisma: LacunaPrismaClient,
  trace: Trace,
  sessionId?: string,
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
      createdAt: new Date(trace.createdAt),
    },
    update: {
      sessionId,
      type: trace.type,
      visibility: trace.visibility,
      weight: trace.weight,
      effectsJson: toJson(trace.effects),
    },
  });

  return mapTrace(row);
}

export async function saveDailyPulse(
  prisma: LacunaPrismaClient,
  pulse: DailyPulse,
  sessionId?: string,
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
      ruleAuditJson: toJson(pulse.ruleAudit),
      observerReportId: pulse.observerReportId,
      createdAt: new Date(pulse.createdAt),
    },
    update: {
      sessionId,
      stateBeforeJson: toJson(pulse.stateBefore),
      traceIdsJson: toJson(pulse.traceIds),
      stateAfterJson: toJson(pulse.stateAfter),
      selectedVariantIdsJson: toJson(pulse.selectedVariantIds),
      ruleAuditJson: toJson(pulse.ruleAudit),
      observerReportId: pulse.observerReportId,
    },
  });

  return mapPulse(row);
}

export async function saveObserverReport(
  prisma: LacunaPrismaClient,
  report: ObserverReport,
  pulseId?: string,
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
      ruleAuditSummaryJson: toJson(report.ruleAuditSummary),
      createdAt: new Date(report.createdAt),
    },
    update: {
      pulseId,
      title: report.title,
      summary: report.summary,
      traceSummaryJson: toJson(report.traceSummary),
      stateDeltaSummaryJson: toJson(report.stateDeltaSummary),
      selectedVariantSummaryJson: toJson(report.selectedVariantSummary),
      ruleAuditSummaryJson: toJson(report.ruleAuditSummary),
    },
  });

  return mapReport(row);
}

export async function listSessionTraces(
  prisma: LacunaPrismaClient,
  session: RuntimeSession,
): Promise<Trace[]> {
  const rows = await prisma.trace.findMany({
    where: {
      sessionId: session.id,
      worldId: session.worldId,
      cityId: session.cityId,
      dayId: session.currentDayId,
      playerTimelineId: { in: session.timelineIds },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map(mapTrace);
}
