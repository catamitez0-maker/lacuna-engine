import { z } from "zod";
import {
  DEFAULT_WORLD_PACK_SCHEMA_VERSION,
  conditionOperatorSchema,
  influenceRadiusSchema,
  numericStateSchema,
  ruleAuditOutcomeSchema,
  semanticVersionSchema,
  stateRuleEnforcementSchema,
  stateValueSchema,
  traceTypeSchema,
  traceVisibilitySchema,
  worldConstantCategorySchema,
  worldConstantSeveritySchema,
  worldPackSchemaVersionSchema,
} from "./base-schemas";
import {
  addIssue,
  idsFor,
  mapById,
  reportDuplicateIds,
  reportDuplicateValues,
  requirePrologueActionCoverage,
  requireReference,
  requireSameCity,
  requireStateKey,
} from "./validation";

export const worldConstantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: worldConstantCategorySchema.default("invariant"),
  severity: worldConstantSeveritySchema.default("hard"),
});

export const stateRuleSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    stateKey: z.string().min(1),
    min: z.number().optional(),
    max: z.number().optional(),
    maxDailyDelta: z.number().nonnegative().optional(),
    enforcement: stateRuleEnforcementSchema.default("report"),
    constantRefs: z.array(z.string()).default([]),
  })
  .refine(
    (rule) =>
      rule.min === undefined || rule.max === undefined || rule.min <= rule.max,
    {
      message: "stateRule min must be less than or equal to max",
    },
  );

export const ruleAuditEntrySchema = z.object({
  ruleId: z.string().min(1),
  stateKey: z.string().min(1),
  enforcement: stateRuleEnforcementSchema,
  outcome: ruleAuditOutcomeSchema,
  before: z.number(),
  proposed: z.number(),
  after: z.number(),
  messages: z.array(z.string()).default([]),
  constantRefs: z.array(z.string()).default([]),
});

export const spinePhaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int(),
  anchorIds: z.array(z.string()).default([]),
});

export const worldSpineSchema = z.object({
  premise: z.string().min(1),
  currentEra: z.string().optional(),
  centralConflict: z.string().optional(),
  fixedAnchorIds: z.array(z.string()).default([]),
  phases: z.array(spinePhaseSchema).default([]),
});

export const conditionSchema = z.object({
  key: z.string().min(1),
  operator: conditionOperatorSchema,
  value: stateValueSchema,
});

export const traceConditionSchema = z.object({
  type: traceTypeSchema.optional(),
  visibility: traceVisibilitySchema.optional(),
  minCount: z.number().int().nonnegative().default(1),
});

export const anchorVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  constantRefs: z.array(z.string()).default([]),
  conditions: z.array(conditionSchema).default([]),
  traceConditions: z.array(traceConditionSchema).default([]),
  effects: numericStateSchema.default({}),
});

export const anchorEventSchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  title: z.string().min(1),
  fixed: z.boolean(),
  constantRefs: z.array(z.string()).default([]),
  variants: z.array(anchorVariantSchema).default([]),
});

export const entryRoleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  entryDayId: z.string().min(1),
  entrySceneId: z.string().min(1),
  influenceRadius: influenceRadiusSchema,
  knowledgeTags: z.array(z.string()).default([]),
  accessTags: z.array(z.string()).default([]),
});

export const identityFragmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  mappedRoleId: z.string().min(1),
  weight: z.number(),
});

export const storyDaySchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int(),
  publicEventIds: z.array(z.string()).default([]),
  roleEventIds: z.array(z.string()).default([]),
  anchorId: z.string().optional(),
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  dayId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  actionIds: z.array(z.string()).default([]),
});

export const prologueActionSchema = z.object({
  id: z.string().min(1),
  label: z.enum(["observe", "help", "hide"]),
  tendency: z.enum(["observe", "help", "hide"]),
});

export const placeholderActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  trace: z.object({
    type: traceTypeSchema,
    visibility: traceVisibilitySchema,
    weight: z.number(),
    effects: numericStateSchema.default({}),
  }),
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
    placeholderActions: z.array(placeholderActionSchema).min(1),
  })
  .superRefine((city, ctx) => {
    const roleIds = idsFor(city.entryRoles);
    const dayIds = idsFor(city.days);
    const anchorIds = idsFor(city.anchors);
    const sceneIds = idsFor(city.scenes);
    const placeholderActionIds = idsFor(city.placeholderActions);
    const stateKeys = new Set(Object.keys(city.stateSchema));
    const anchorById = mapById(city.anchors);
    const sceneById = mapById(city.scenes);
    const referencedAnchorIds = new Set(
      city.days.flatMap((day) => (day.anchorId ? [day.anchorId] : [])),
    );
    const referencedActionIds = new Set(
      city.scenes.flatMap((scene) => scene.actionIds),
    );

    reportDuplicateIds(ctx, "entryRoles", city.entryRoles);
    reportDuplicateIds(ctx, "identityFragments", city.identityFragments);
    reportDuplicateIds(ctx, "days", city.days);
    reportDuplicateIds(ctx, "anchors", city.anchors);
    reportDuplicateIds(ctx, "scenes", city.scenes);
    reportDuplicateIds(ctx, "prologueActions", city.prologueActions);
    reportDuplicateIds(ctx, "placeholderActions", city.placeholderActions);
    reportDuplicateValues(
      ctx,
      "days contains duplicate order",
      city.days.map((day) => day.order),
    );
    requirePrologueActionCoverage(ctx, city.prologueActions);

    for (const key of Object.keys(city.initialState)) {
      requireStateKey(ctx, stateKeys, key, `initialState key ${key}`);
    }

    for (const role of city.entryRoles) {
      requireReference(
        ctx,
        dayIds,
        role.entryDayId,
        `entryRole ${role.id} entryDayId`,
      );
      requireReference(
        ctx,
        sceneIds,
        role.entrySceneId,
        `entryRole ${role.id} entrySceneId`,
      );

      const entryScene = sceneById.get(role.entrySceneId);
      if (entryScene && entryScene.dayId !== role.entryDayId) {
        addIssue(
          ctx,
          `entryRole ${role.id} entrySceneId must belong to entryDayId ${role.entryDayId}`,
        );
      }
    }

    for (const fragment of city.identityFragments) {
      requireReference(
        ctx,
        roleIds,
        fragment.mappedRoleId,
        `identityFragment ${fragment.id} mappedRoleId`,
      );
    }

    for (const day of city.days) {
      requireSameCity(ctx, city.id, day.cityId, `storyDay ${day.id}`);
      if (day.anchorId) {
        requireReference(
          ctx,
          anchorIds,
          day.anchorId,
          `storyDay ${day.id} anchorId`,
        );

        const anchor = anchorById.get(day.anchorId);
        if (anchor && anchor.dayId !== day.id) {
          addIssue(
            ctx,
            `storyDay ${day.id} anchorId must target an anchor for the same day`,
          );
        }
      }
    }

    for (const anchor of city.anchors) {
      requireSameCity(ctx, city.id, anchor.cityId, `anchor ${anchor.id}`);
      requireReference(ctx, dayIds, anchor.dayId, `anchor ${anchor.id} dayId`);

      if (!referencedAnchorIds.has(anchor.id)) {
        addIssue(
          ctx,
          `anchor ${anchor.id} is not referenced by any storyDay anchorId`,
        );
      }

      for (const variant of anchor.variants) {
        for (const condition of variant.conditions) {
          requireStateKey(
            ctx,
            stateKeys,
            condition.key,
            `anchorVariant ${variant.id} condition key ${condition.key}`,
          );
        }

        for (const key of Object.keys(variant.effects)) {
          requireStateKey(
            ctx,
            stateKeys,
            key,
            `anchorVariant ${variant.id} effect key ${key}`,
          );
        }
      }
    }

    for (const scene of city.scenes) {
      requireSameCity(ctx, city.id, scene.cityId, `scene ${scene.id}`);
      requireReference(ctx, dayIds, scene.dayId, `scene ${scene.id} dayId`);

      for (const actionId of scene.actionIds) {
        requireReference(
          ctx,
          placeholderActionIds,
          actionId,
          `scene ${scene.id} actionIds`,
        );
      }
    }

    for (const action of city.placeholderActions) {
      if (!referencedActionIds.has(action.id)) {
        addIssue(
          ctx,
          `placeholderAction ${action.id} is not referenced by any scene`,
        );
      }

      for (const key of Object.keys(action.trace.effects)) {
        requireStateKey(
          ctx,
          stateKeys,
          key,
          `placeholderAction ${action.id} trace effect key ${key}`,
        );
      }
    }
  });

export const worldPackSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    schemaVersion: worldPackSchemaVersionSchema.default(
      DEFAULT_WORLD_PACK_SCHEMA_VERSION,
    ),
    version: semanticVersionSchema,
    description: z.string().optional(),
    enabled: z.boolean().default(false),
    constants: z.array(worldConstantSchema).default([]),
    stateRules: z.array(stateRuleSchema).default([]),
    spine: worldSpineSchema.optional(),
    cities: z.array(cityModuleSchema).min(1),
  })
  .superRefine((world, ctx) => {
    const constantIds = idsFor(world.constants);
    const stateKeys = new Set(
      world.cities.flatMap((city) => Object.keys(city.stateSchema)),
    );
    const anchorIds = new Set(
      world.cities.flatMap((city) => city.anchors.map((anchor) => anchor.id)),
    );

    reportDuplicateIds(ctx, "cities", world.cities);
    reportDuplicateIds(ctx, "constants", world.constants);
    reportDuplicateIds(ctx, "stateRules", world.stateRules);

    for (const rule of world.stateRules) {
      requireStateKey(
        ctx,
        stateKeys,
        rule.stateKey,
        `stateRule ${rule.id} stateKey ${rule.stateKey}`,
      );
      for (const constantRef of rule.constantRefs) {
        requireReference(
          ctx,
          constantIds,
          constantRef,
          `stateRule ${rule.id} constantRefs`,
        );
      }
    }

    if (world.spine) {
      reportDuplicateIds(ctx, "spine phases", world.spine.phases);
      reportDuplicateValues(
        ctx,
        "spine phases contains duplicate order",
        world.spine.phases.map((phase) => phase.order),
      );

      for (const anchorId of world.spine.fixedAnchorIds) {
        requireReference(ctx, anchorIds, anchorId, "spine fixedAnchorIds");
      }

      for (const phase of world.spine.phases) {
        for (const anchorId of phase.anchorIds) {
          requireReference(
            ctx,
            anchorIds,
            anchorId,
            `spine phase ${phase.id} anchorIds`,
          );
        }
      }
    }

    for (const city of world.cities) {
      for (const anchor of city.anchors) {
        for (const constantRef of anchor.constantRefs) {
          requireReference(
            ctx,
            constantIds,
            constantRef,
            `anchor ${anchor.id} constantRefs`,
          );
        }

        for (const variant of anchor.variants) {
          for (const constantRef of variant.constantRefs) {
            requireReference(
              ctx,
              constantIds,
              constantRef,
              `anchorVariant ${variant.id} constantRefs`,
            );
          }
        }
      }
    }
  });
