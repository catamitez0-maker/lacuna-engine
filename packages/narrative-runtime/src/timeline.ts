import {
  generateIdentityFragments,
  recordPrologueAction,
  summarizePrologueTendency,
  type PrologueRecord,
} from "@lacuna-engine/identity-mapper";
import {
  playerTimelineSchema,
  type CityModule,
  type IdentityFragment,
  type PlayerTimeline,
} from "@lacuna-engine/schema";
import { DEFAULT_DEMO_PLAYER_ID } from "./constants";
import { findById } from "./entities";
import { createTimelineId } from "./ids";
import type { TimelineInput } from "./types";

export function selectPrologueAction(
  city: CityModule,
  actionId: string,
): PrologueRecord {
  return recordPrologueAction(city, actionId);
}

export function listIdentityFragments(
  city: CityModule,
  records: PrologueRecord[] = [],
): IdentityFragment[] {
  return generateIdentityFragments(city, records);
}

export function createPlayerTimelineFromFragment({
  world,
  city,
  fragment,
  prologueRecords = [],
  playerId = DEFAULT_DEMO_PLAYER_ID,
}: TimelineInput): PlayerTimeline {
  const role = findById(city.entryRoles, fragment.mappedRoleId, "mapped role");

  findById(city.days, role.entryDayId, "entry day");
  findById(city.scenes, role.entrySceneId, "entry scene");

  return playerTimelineSchema.parse({
    id: createTimelineId(world, city, fragment),
    playerId,
    worldId: world.id,
    cityId: city.id,
    roleId: role.id,
    currentDayId: role.entryDayId,
    currentSceneId: role.entrySceneId,
    personalFlags: {
      selectedFragmentId: fragment.id,
      entryTendency: summarizePrologueTendency(prologueRecords),
    },
    unlockedArchiveIds: [],
  });
}
