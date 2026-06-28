import { z } from "zod";

export const influenceRadiusSchema = z.enum([
  "personal",
  "local",
  "regional",
  "global"
]);

export const traceTypeSchema = z.enum([
  "archive",
  "witness",
  "survivor",
  "object",
  "rumor",
  "corpse",
  "location_state",
  "system_record"
]);

export const traceVisibilitySchema = z.enum(["hidden", "local", "public"]);

export const conditionOperatorSchema = z.enum([
  ">",
  ">=",
  "<",
  "<=",
  "==",
  "!="
]);

export const stateValueSchema = z.union([
  z.number(),
  z.string(),
  z.boolean()
]);

export const numericStateSchema = z.record(z.string(), z.number());

export const conditionSchema = z.object({
  key: z.string().min(1),
  operator: conditionOperatorSchema,
  value: stateValueSchema
});

export const anchorVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  conditions: z.array(conditionSchema).default([]),
  effects: numericStateSchema.default({})
});

export const anchorEventSchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  title: z.string().min(1),
  fixed: z.boolean(),
  variants: z.array(anchorVariantSchema).default([])
});

export const entryRoleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  entryDayId: z.string().min(1),
  entrySceneId: z.string().min(1),
  influenceRadius: influenceRadiusSchema,
  knowledgeTags: z.array(z.string()).default([]),
  accessTags: z.array(z.string()).default([])
});

export const identityFragmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  mappedRoleId: z.string().min(1),
  weight: z.number()
});

export const storyDaySchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int(),
  publicEventIds: z.array(z.string()).default([]),
  roleEventIds: z.array(z.string()).default([]),
  anchorId: z.string().optional()
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  actionIds: z.array(z.string()).default([])
});

export const prologueActionSchema = z.object({
  id: z.string().min(1),
  label: z.enum(["observe", "help", "hide"]),
  tendency: z.enum(["observe", "help", "hide"])
});

export const placeholderActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  trace: z.object({
    type: traceTypeSchema,
    visibility: traceVisibilitySchema,
    weight: z.number(),
    effects: numericStateSchema.default({})
  })
});

export const cityModuleSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    stateSchema: z.record(z.string(), z.unknown()),
    initialState: numericStateSchema.default({}),
    entryRoles: z.array(entryRoleSchema).min(1),
    identityFragments: z.array(identityFragmentSchema).length(3),
    days: z.array(storyDaySchema).min(1),
    anchors: z.array(anchorEventSchema).default([]),
    scenes: z.array(sceneSchema).min(1),
    prologueActions: z.array(prologueActionSchema).length(3),
    placeholderActions: z.array(placeholderActionSchema).min(1)
  })
  .superRefine((city, ctx) => {
    const roleIds = idsFor(city.entryRoles);
    const dayIds = idsFor(city.days);
    const anchorIds = idsFor(city.anchors);
    const sceneIds = idsFor(city.scenes);
    const placeholderActionIds = idsFor(city.placeholderActions);

    reportDuplicateIds(ctx, "entryRoles", city.entryRoles);
    reportDuplicateIds(ctx, "identityFragments", city.identityFragments);
    reportDuplicateIds(ctx, "days", city.days);
    reportDuplicateIds(ctx, "anchors", city.anchors);
    reportDuplicateIds(ctx, "scenes", city.scenes);
    reportDuplicateIds(ctx, "prologueActions", city.prologueActions);
    reportDuplicateIds(ctx, "placeholderActions", city.placeholderActions);

    for (const role of city.entryRoles) {
      requireReference(ctx, dayIds, role.entryDayId, `entryRole ${role.id} entryDayId`);
      requireReference(
        ctx,
        sceneIds,
        role.entrySceneId,
        `entryRole ${role.id} entrySceneId`
      );
    }

    for (const fragment of city.identityFragments) {
      requireReference(
        ctx,
        roleIds,
        fragment.mappedRoleId,
        `identityFragment ${fragment.id} mappedRoleId`
      );
    }

    for (const day of city.days) {
      requireSameCity(ctx, city.id, day.cityId, `storyDay ${day.id}`);
      if (day.anchorId) {
        requireReference(ctx, anchorIds, day.anchorId, `storyDay ${day.id} anchorId`);
      }
    }

    for (const anchor of city.anchors) {
      requireSameCity(ctx, city.id, anchor.cityId, `anchor ${anchor.id}`);
      requireReference(ctx, dayIds, anchor.dayId, `anchor ${anchor.id} dayId`);
    }

    for (const scene of city.scenes) {
      requireSameCity(ctx, city.id, scene.cityId, `scene ${scene.id}`);
      requireReference(ctx, dayIds, scene.dayId, `scene ${scene.id} dayId`);

      for (const actionId of scene.actionIds) {
        requireReference(
          ctx,
          placeholderActionIds,
          actionId,
          `scene ${scene.id} actionIds`
        );
      }
    }
  });

export const worldPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  cities: z.array(cityModuleSchema).min(1)
});

export const playerTimelineSchema = z.object({
  id: z.string().min(1),
  playerId: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  roleId: z.string().min(1),
  currentDayId: z.string().min(1),
  currentSceneId: z.string().min(1),
  personalFlags: z.record(z.string(), stateValueSchema),
  unlockedArchiveIds: z.array(z.string())
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
  createdAt: z.string().datetime()
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
  observerReportId: z.string().min(1),
  createdAt: z.string().datetime()
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
  createdAt: z.string().datetime()
});

export const runtimeSessionStatusSchema = z.enum([
  "open",
  "settled",
  "archived"
]);

export const runtimeSessionSchema = z.object({
  id: z.string().min(1),
  worldId: z.string().min(1),
  cityId: z.string().min(1),
  currentDayId: z.string().min(1),
  timelineIds: z.array(z.string()),
  status: runtimeSessionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type InfluenceRadius = z.infer<typeof influenceRadiusSchema>;
export type TraceType = z.infer<typeof traceTypeSchema>;
export type TraceVisibility = z.infer<typeof traceVisibilitySchema>;
export type ConditionOperator = z.infer<typeof conditionOperatorSchema>;
export type StateValue = z.infer<typeof stateValueSchema>;
export type NumericState = z.infer<typeof numericStateSchema>;
export type Condition = z.infer<typeof conditionSchema>;
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

export function parseWorldPack(input: unknown): WorldPack {
  return worldPackSchema.parse(input);
}

function idsFor(items: Array<{ id: string }>): Set<string> {
  return new Set(items.map((item) => item.id));
}

function reportDuplicateIds(
  ctx: z.RefinementCtx,
  label: string,
  items: Array<{ id: string }>
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  for (const id of duplicates) {
    addIssue(ctx, `${label} contains duplicate id ${id}`);
  }
}

function requireReference(
  ctx: z.RefinementCtx,
  ids: Set<string>,
  referencedId: string,
  label: string
): void {
  if (!ids.has(referencedId)) {
    addIssue(ctx, `${label} references missing id ${referencedId}`);
  }
}

function requireSameCity(
  ctx: z.RefinementCtx,
  cityId: string,
  referencedCityId: string,
  label: string
): void {
  if (referencedCityId !== cityId) {
    addIssue(ctx, `${label} cityId must be ${cityId}`);
  }
}

function addIssue(ctx: z.RefinementCtx, message: string): void {
  ctx.addIssue({
    code: "custom",
    message
  });
}
