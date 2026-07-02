import { z } from "zod";

export const SUPPORTED_WORLD_PACK_SCHEMA_VERSIONS = ["0.1.0"] as const;
export const DEFAULT_WORLD_PACK_SCHEMA_VERSION =
  SUPPORTED_WORLD_PACK_SCHEMA_VERSIONS[0];

export const semanticVersionSchema = z
  .string()
  .regex(
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "Version must use semantic version format, for example 0.1.0",
  );

export const worldPackSchemaVersionSchema = z.enum(
  SUPPORTED_WORLD_PACK_SCHEMA_VERSIONS,
);

export const influenceRadiusSchema = z.enum([
  "personal",
  "local",
  "regional",
  "global",
]);

export const traceTypeSchema = z.enum([
  "archive",
  "witness",
  "survivor",
  "object",
  "rumor",
  "corpse",
  "location_state",
  "system_record",
]);

export const traceVisibilitySchema = z.enum(["hidden", "local", "public"]);

export const conditionOperatorSchema = z.enum([
  ">",
  ">=",
  "<",
  "<=",
  "==",
  "!=",
]);

export const worldConstantCategorySchema = z.enum([
  "invariant",
  "prohibition",
  "causal",
  "tone",
]);

export const worldConstantSeveritySchema = z.enum(["hard", "soft"]);
export const stateRuleEnforcementSchema = z.enum(["report", "clamp", "reject"]);
export const ruleAuditOutcomeSchema = z.enum(["ok", "violation", "clamped"]);

export const stateValueSchema = z.union([z.number(), z.string(), z.boolean()]);

export const numericStateSchema = z.record(z.string(), z.number());
