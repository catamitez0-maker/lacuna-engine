import { z } from "zod";
import {
  numericStateSchema,
  stateValueSchema,
  traceTypeSchema,
  traceVisibilitySchema,
} from "./base-schemas";
import { ruleAuditEntrySchema } from "./world-schemas";

export const playerTimelineSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  roleId: z.string().min(1),
  currentDayId: z.string().min(1),
  currentSceneId: z.string().min(1),
  personalFlags: z.record(z.string(), stateValueSchema),
  unlockedArchiveIds: z.array(z.string()),
});

export const traceSchema = z.object({
  id: z.string().min(1),
  playerTimelineId: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  type: traceTypeSchema,
  visibility: traceVisibilitySchema,
  weight: z.number(),
  effects: numericStateSchema,
  createdAt: z.string().datetime(),
});

export const dailyPulseSchema = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  stateBefore: numericStateSchema,
  traceIds: z.array(z.string()),
  stateAfter: numericStateSchema,
  selectedVariantIds: z.array(z.string()),
  ruleAudit: z.array(ruleAuditEntrySchema).default([]),
  observerReportId: z.string().min(1),
  createdAt: z.string().datetime(),
});

export const observerReportSchema = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  traceSummary: z.array(z.string()),
  stateDeltaSummary: z.array(z.string()),
  selectedVariantSummary: z.array(z.string()),
  ruleAuditSummary: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});

export const runtimeSessionStatusSchema = z.enum([
  "open",
  "paused",
  "settled",
  "archived",
]);

export const runtimeSessionSchema = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  currentDayId: z.string().min(1),
  timelineIds: z.array(z.string()),
  status: runtimeSessionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
