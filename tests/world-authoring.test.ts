import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import { parseWorldPack } from "@lacuna-engine/schema";
import {
  applyStructuredPatch,
  type StructuredPatchInput,
  type StructuredRecord,
} from "@lacuna-engine/world-authoring";

const CONTENT_DIR = join(process.cwd(), "content/worlds");

describe("world authoring patches", () => {
  it("creates constants and state rules outside the Studio action layer", () => {
    const world = editableWorld();

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "constantCreate",
          constantId: "auditability-is-required",
          title: "Auditability Is Required",
          description: "Every rule change should remain explainable.",
          category: "causal",
          severity: "hard",
        }),
      ),
    ).toMatchObject({ ok: true });

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "stateRuleCreate",
          stateRuleId: "trace-weight-bound",
          title: "Trace Weight Bound",
          stateKey: "trace_weight",
          enforcement: "report",
          maxDailyDelta: "3",
          constantRefs: "auditability-is-required",
        }),
      ),
    ).toMatchObject({ ok: true });

    const parsed = parseWorldPack(world);
    expect(parsed.constants.map((constant) => constant.id)).toContain(
      "auditability-is-required",
    );
    expect(parsed.stateRules.map((rule) => rule.id)).toContain(
      "trace-weight-bound",
    );
  });

  it("creates and reorders spine phases with stable order values", () => {
    const world = editableWorld();

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "spinePhaseCreate",
          phaseId: "second-phase",
          title: "Second Phase",
          anchorIds: "placeholder-anchor-1",
        }),
      ),
    ).toMatchObject({ ok: true });

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "spinePhase",
          phaseId: "second-phase",
          intent: "moveUp",
        }),
      ),
    ).toMatchObject({ ok: true });

    const parsed = parseWorldPack(world);
    expect(
      parsed.spine?.phases.map((phase) => [phase.id, phase.order]),
    ).toEqual([
      ["second-phase", 1],
      ["placeholder-opening", 2],
    ]);
  });

  it("updates city action trace effects through the package layer", () => {
    const world = editableWorld();

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "action",
          cityId: "placeholder-city-module",
          actionId: "placeholder-action-record",
          label: "updated placeholder action",
          weight: "2",
          effectKey: ["trace_weight", "continuity"],
          "effect:trace_weight": "3",
          "effect:continuity": "1",
        }),
      ),
    ).toMatchObject({ ok: true });

    const parsed = parseWorldPack(world);
    const action = parsed.cities[0]?.placeholderActions[0];
    expect(action?.label).toBe("updated placeholder action");
    expect(action?.trace.weight).toBe(2);
    expect(action?.trace.effects).toEqual({
      continuity: 1,
      trace_weight: 3,
    });
  });

  it("reports unknown structured targets without requiring a city id", () => {
    const world = editableWorld();

    expect(
      applyStructuredPatch(
        world,
        patchInput({
          target: "notARealEditor",
        }),
      ),
    ).toMatchObject({
      ok: false,
      message: "Unknown structured edit target notARealEditor.",
    });
  });
});

function editableWorld(): StructuredRecord {
  return structuredClone(
    loadEmptyWorldTemplate({ contentDir: CONTENT_DIR }),
  ) as unknown as StructuredRecord;
}

function patchInput(
  entries: Record<string, string | string[]>,
): StructuredPatchInput {
  return {
    get: (key) => {
      const value = entries[key];
      return Array.isArray(value) ? value[0] : value;
    },
    getAll: (key) => {
      const value = entries[key];
      if (value === undefined) {
        return [];
      }
      return Array.isArray(value) ? value : [value];
    },
  };
}
