import { describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader";
import {
  createPlayerTimelineFromFragment,
  createRuntimeSession,
  listIdentityFragments,
  performRuntimeAction,
  selectPrologueAction,
  settleRuntimeSessionPulse
} from "@lacuna-engine/narrative-runtime";

const world = loadEmptyWorldTemplate();
const city = world.cities[0]!;
const prologueRecord = selectPrologueAction(city, "prologue-observe");
const fragments = listIdentityFragments(city, [prologueRecord]);

describe("runtime session aggregation", () => {
  it("settles one pulse from traces across multiple timelines", () => {
    const firstTimeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragments[0]!,
      prologueRecords: [prologueRecord],
      playerId: "player-one"
    });
    const secondTimeline = createPlayerTimelineFromFragment({
      world,
      city,
      fragment: fragments[1]!,
      prologueRecords: [prologueRecord],
      playerId: "player-two"
    });
    const session = createRuntimeSession({
      world,
      city,
      timelineIds: [firstTimeline.id, secondTimeline.id],
      now: "2026-01-01T00:00:00.000Z"
    });
    const traces = [
      performRuntimeAction({
        city,
        timeline: firstTimeline,
        actionId: "placeholder-action-record",
        now: "2026-01-01T00:00:00.000Z",
        sequence: 1
      }),
      performRuntimeAction({
        city,
        timeline: secondTimeline,
        actionId: "placeholder-action-record",
        now: "2026-01-01T00:00:00.000Z",
        sequence: 1
      })
    ];

    const { pulse, observerReport } = settleRuntimeSessionPulse({
      world,
      city,
      session,
      traces,
      now: "2026-01-01T00:00:00.000Z"
    });

    expect(pulse.traceIds).toHaveLength(2);
    expect(pulse.stateAfter.trace_weight).toBe(2);
    expect(pulse.stateAfter.continuity).toBe(5);
    expect(observerReport.traceSummary).toHaveLength(2);
  });
});
