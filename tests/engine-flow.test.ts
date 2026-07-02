import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { selectAnchorVariants } from "@lacuna-engine/anchor-resolver";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import { parseWorldPack } from "@lacuna-engine/schema";
import {
  createPlayerTimelineFromFragment,
  getPrimaryCity,
  listIdentityFragments,
  performRuntimeAction,
  selectPrologueAction,
  settleRuntimePulse,
} from "@lacuna-engine/narrative-runtime";

describe("framework engine flow", () => {
  const world = loadEmptyWorldTemplate({
    contentDir: join(process.cwd(), "content/worlds"),
  });
  const city = getPrimaryCity(world);
  const prologueRecord = selectPrologueAction(city, "prologue-observe");
  const fragments = listIdentityFragments(city, [prologueRecord]);
  const fragment = fragments[0];

  it("loads the disabled empty world template", () => {
    expect(world.id).toBe("empty-world-template");
    expect(world.enabled).toBe(false);
    expect(city.id).toBe("placeholder-city-module");
  });

  it("rejects content packs with broken internal references", () => {
    const invalidWorld = structuredClone(world);

    invalidWorld.cities[0]!.scenes[0]!.actionIds = ["missing-action"];

    expect(() => parseWorldPack(invalidWorld)).toThrow(/missing-action/);
  });

  it("generates exactly three identity fragments", () => {
    expect(fragments).toHaveLength(3);
    expect(fragments.map((candidate) => candidate.label)).toEqual([
      "Fragment A",
      "Fragment B",
      "Fragment C",
    ]);
  });

  it("creates a PlayerTimeline after selecting a fragment", () => {
    expect(fragment).toBeDefined();

    const timeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });

    expect(timeline.worldId).toBe(world.id);
    expect(timeline.cityId).toBe(city.id);
    expect(timeline.roleId).toBe(fragment?.mappedRoleId);
    expect(timeline.currentSceneId).toBe("placeholder-scene-opening");
  });

  it("creates a Trace from a placeholder action", () => {
    const timeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });
    const trace = performRuntimeAction({
      city,
      timeline,
      actionId: "placeholder-action-record",
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(trace.type).toBe("system_record");
    expect(trace.effects.trace_weight).toBe(1);
  });

  it("updates city state during DailyPulse", () => {
    const timeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });
    const trace = performRuntimeAction({
      city,
      timeline,
      actionId: "placeholder-action-record",
      now: "2026-01-01T00:00:00.000Z",
    });
    const { pulse } = settleRuntimePulse({
      world,
      city,
      timeline,
      traces: [trace],
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(pulse.stateBefore.trace_weight).toBe(0);
    expect(pulse.stateAfter.trace_weight).toBe(1);
    expect(pulse.stateAfter.continuity).toBe(4);
  });

  it("selects anchor variants from conditions", () => {
    const anchor = city.anchors.find(
      (candidate) => candidate.id === "placeholder-anchor-1",
    );

    const selected = selectAnchorVariants(anchor, {
      continuity: 1,
      trace_weight: 1,
    });

    expect(selected.map((variant) => variant.id)).toContain(
      "placeholder-variant-trace",
    );
  });

  it("selects anchor variants from trace conditions", () => {
    const timeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });
    const trace = performRuntimeAction({
      city,
      timeline,
      actionId: "placeholder-action-record",
      now: "2026-01-01T00:00:00.000Z",
    });
    const anchor = structuredClone(
      city.anchors.find(
        (candidate) => candidate.id === "placeholder-anchor-1",
      )!,
    );

    anchor.variants[1]!.traceConditions = [
      { visibility: "local", minCount: 1 },
    ];

    expect(
      selectAnchorVariants(anchor, { continuity: 1, trace_weight: 1 }, []).map(
        (variant) => variant.id,
      ),
    ).not.toContain("placeholder-variant-trace");
    expect(
      selectAnchorVariants(anchor, { continuity: 1, trace_weight: 1 }, [
        trace,
      ]).map((variant) => variant.id),
    ).toContain("placeholder-variant-trace");
  });

  it("clamps state rule violations when enforcement is clamp", () => {
    const clampedWorld = structuredClone(world);
    clampedWorld.stateRules[0]!.enforcement = "clamp";
    const timeline = createPlayerTimelineFromFragment({
      world: clampedWorld,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });
    const trace = performRuntimeAction({
      city,
      timeline,
      actionId: "placeholder-action-record",
      now: "2026-01-01T00:00:00.000Z",
    });
    const { pulse } = settleRuntimePulse({
      world: clampedWorld,
      city,
      timeline,
      traces: [trace],
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(pulse.stateAfter.continuity).toBe(2);
    expect(pulse.ruleAudit).toEqual([
      expect.objectContaining({
        ruleId: "continuity-daily-bound",
        outcome: "clamped",
      }),
    ]);
  });

  it("creates an ObserverReport after settlement", () => {
    const timeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragment!,
      prologueRecords: [prologueRecord],
    });
    const trace = performRuntimeAction({
      city,
      timeline,
      actionId: "placeholder-action-record",
      now: "2026-01-01T00:00:00.000Z",
    });
    const { observerReport } = settleRuntimePulse({
      world,
      city,
      timeline,
      traces: [trace],
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(observerReport.traceSummary).toHaveLength(1);
    expect(observerReport.stateDeltaSummary.length).toBeGreaterThan(0);
    expect(observerReport.selectedVariantSummary).toEqual([
      "placeholder-variant-neutral: Placeholder Variant Neutral",
      "placeholder-variant-trace: Placeholder Variant With Trace",
    ]);
    expect(observerReport.ruleAuditSummary).toEqual([
      expect.stringContaining("continuity-daily-bound: violation"),
    ]);
  });
});
