import type { WorldPack } from "@lacuna-engine/schema";
import { FRAMEWORK_DEMO_TIMESTAMP } from "./constants";
import { getEntryScene, getPrimaryCity, firstEntity } from "./entities";
import { performRuntimeAction } from "./actions";
import { settleRuntimePulse } from "./pulse";
import {
  createPlayerTimelineFromFragment,
  listIdentityFragments,
  selectPrologueAction,
} from "./timeline";
import type { FrameworkDemoResult } from "./types";

export function runFrameworkDemo(world: WorldPack): FrameworkDemoResult {
  const city = getPrimaryCity(world);
  const prologueAction = firstEntity(
    city.prologueActions,
    "City module has no prologue actions",
  );
  const prologueRecord = selectPrologueAction(city, prologueAction.id);
  const fragments = listIdentityFragments(city, [prologueRecord]);
  const selectedFragment = firstEntity(
    fragments,
    "Identity mapper returned no fragments",
  );
  const timeline = createPlayerTimelineFromFragment({
    world,
    city,
    fragment: selectedFragment,
    prologueRecords: [prologueRecord],
  });
  const scene = getEntryScene(city, timeline);
  const action = firstEntity(
    city.placeholderActions,
    "City module has no placeholder actions",
  );
  const trace = performRuntimeAction({
    city,
    timeline,
    actionId: action.id,
    now: FRAMEWORK_DEMO_TIMESTAMP,
  });
  const { pulse, observerReport } = settleRuntimePulse({
    world,
    city,
    timeline,
    traces: [trace],
    now: FRAMEWORK_DEMO_TIMESTAMP,
  });

  return {
    world,
    city,
    prologueAction,
    fragments,
    selectedFragment,
    timeline,
    scene,
    action,
    traces: [trace],
    pulse,
    observerReport,
  };
}
