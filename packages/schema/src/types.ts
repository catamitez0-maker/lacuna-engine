import { z } from "zod";
import {
  anchorEventSchema,
  anchorVariantSchema,
  cityModuleSchema,
  conditionOperatorSchema,
  conditionSchema,
  dailyPulseSchema,
  entryRoleSchema,
  identityFragmentSchema,
  influenceRadiusSchema,
  numericStateSchema,
  observerReportSchema,
  placeholderActionSchema,
  playerTimelineSchema,
  prologueActionSchema,
  ruleAuditEntrySchema,
  ruleAuditOutcomeSchema,
  runtimeSessionSchema,
  runtimeSessionStatusSchema,
  sceneSchema,
  spinePhaseSchema,
  stateRuleEnforcementSchema,
  stateRuleSchema,
  stateValueSchema,
  storyDaySchema,
  traceConditionSchema,
  traceSchema,
  traceTypeSchema,
  traceVisibilitySchema,
  worldConstantCategorySchema,
  worldConstantSchema,
  worldConstantSeveritySchema,
  worldPackSchema,
  worldSpineSchema,
} from "./schemas";

export type InfluenceRadius = z.infer<typeof influenceRadiusSchema>;
export type TraceType = z.infer<typeof traceTypeSchema>;
export type TraceVisibility = z.infer<typeof traceVisibilitySchema>;
export type ConditionOperator = z.infer<typeof conditionOperatorSchema>;
export type WorldConstantCategory = z.infer<typeof worldConstantCategorySchema>;
export type WorldConstantSeverity = z.infer<typeof worldConstantSeveritySchema>;
export type StateRuleEnforcement = z.infer<typeof stateRuleEnforcementSchema>;
export type RuleAuditOutcome = z.infer<typeof ruleAuditOutcomeSchema>;
export type StateValue = z.infer<typeof stateValueSchema>;
export type NumericState = z.infer<typeof numericStateSchema>;
export type WorldConstant = z.infer<typeof worldConstantSchema>;
export type StateRule = z.infer<typeof stateRuleSchema>;
export type RuleAuditEntry = z.infer<typeof ruleAuditEntrySchema>;
export type SpinePhase = z.infer<typeof spinePhaseSchema>;
export type WorldSpine = z.infer<typeof worldSpineSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type TraceCondition = z.infer<typeof traceConditionSchema>;
export type AnchorVariant = z.infer<typeof anchorVariantSchema>;
export type AnchorEvent = z.infer<typeof anchorEventSchema>;
export type EntryRole = z.infer<typeof entryRoleSchema>;
export type IdentityFragment = z.infer<typeof identityFragmentSchema>;
export type StoryDay = z.infer<typeof storyDaySchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type PrologueAction = z.infer<typeof prologueActionSchema>;
export type PlaceholderAction = z.infer<typeof placeholderActionSchema>;
export type CityModule = z.infer<typeof cityModuleSchema>;
export type WorldPack = z.infer<typeof worldPackSchema>;
export type PlayerTimeline = z.infer<typeof playerTimelineSchema>;
export type Trace = z.infer<typeof traceSchema>;
export type DailyPulse = z.infer<typeof dailyPulseSchema>;
export type ObserverReport = z.infer<typeof observerReportSchema>;
export type RuntimeSessionStatus = z.infer<typeof runtimeSessionStatusSchema>;
export type RuntimeSession = z.infer<typeof runtimeSessionSchema>;
