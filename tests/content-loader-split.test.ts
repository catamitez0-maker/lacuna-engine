import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  loadWorldPackById,
  validateWorldPackById,
} from "@lacuna-engine/content-loader/server";

describe("split content loader", () => {
  it("loads a world pack from directory-level city files", () => {
    const contentDir = mkdtempSync(join(tmpdir(), "lacuna-content-"));
    const worldDir = join(contentDir, "split-world");
    const citiesDir = join(worldDir, "cities");
    const rolesDir = join(worldDir, "roles");
    const daysDir = join(worldDir, "days");
    const anchorsDir = join(worldDir, "anchors");
    const scenesDir = join(worldDir, "scenes");
    const actionsDir = join(worldDir, "actions");
    const prologueDir = join(worldDir, "prologue-actions");

    for (const dir of [
      citiesDir,
      rolesDir,
      daysDir,
      anchorsDir,
      scenesDir,
      actionsDir,
      prologueDir,
    ]) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(
      join(worldDir, "world.yaml"),
      `id: split-world\nname: Split World\nversion: 0.1.0\nenabled: false\n`,
    );
    writeFileSync(
      join(citiesDir, "city.yaml"),
      `id: split-city\nname: Split City\ndescription: A city module would appear here.\nstateSchema:\n  continuity:\n    type: number\n  trace_weight:\n    type: number\ninitialState:\n  continuity: 0\n  trace_weight: 0\n`,
    );
    writeFileSync(
      join(rolesDir, "roles.yaml"),
      `entryRoles:\n  - id: split-role-a\n    title: Split Role A\n    entryDayId: split-day\n    entrySceneId: split-scene\n    influenceRadius: personal\n    knowledgeTags: []\n    accessTags: []\n  - id: split-role-b\n    title: Split Role B\n    entryDayId: split-day\n    entrySceneId: split-scene\n    influenceRadius: local\n    knowledgeTags: []\n    accessTags: []\n  - id: split-role-c\n    title: Split Role C\n    entryDayId: split-day\n    entrySceneId: split-scene\n    influenceRadius: regional\n    knowledgeTags: []\n    accessTags: []\nidentityFragments:\n  - id: split-fragment-a\n    label: Fragment A\n    description: A fragment choice would appear here.\n    mappedRoleId: split-role-a\n    weight: 1\n  - id: split-fragment-b\n    label: Fragment B\n    description: A fragment choice would appear here.\n    mappedRoleId: split-role-b\n    weight: 1\n  - id: split-fragment-c\n    label: Fragment C\n    description: A fragment choice would appear here.\n    mappedRoleId: split-role-c\n    weight: 1\n`,
    );
    writeFileSync(
      join(daysDir, "day.yaml"),
      `id: split-day\ncityId: split-city\ntitle: Split Day\norder: 1\npublicEventIds: []\nroleEventIds: []\nanchorId: split-anchor\n`,
    );
    writeFileSync(
      join(anchorsDir, "anchor.yaml"),
      `id: split-anchor\ncityId: split-city\ndayId: split-day\ntitle: Split Anchor\nfixed: true\nvariants:\n  - id: split-variant\n    title: Split Variant\n    conditions:\n      - key: continuity\n        operator: \">=\"\n        value: 0\n    effects:\n      continuity: 1\n`,
    );
    writeFileSync(
      join(scenesDir, "scene.yaml"),
      `id: split-scene\ncityId: split-city\ndayId: split-day\ntitle: Split Scene\nbody: A placeholder scene would appear here.\nactionIds:\n  - split-action\n`,
    );
    writeFileSync(
      join(prologueDir, "actions.yaml"),
      `- id: split-observe\n  label: observe\n  tendency: observe\n- id: split-help\n  label: help\n  tendency: help\n- id: split-hide\n  label: hide\n  tendency: hide\n`,
    );
    writeFileSync(
      join(actionsDir, "action.yaml"),
      `id: split-action\nlabel: placeholder action\ntrace:\n  type: system_record\n  visibility: local\n  weight: 1\n  effects:\n    trace_weight: 1\n`,
    );

    const result = validateWorldPackById("split-world", { contentDir });
    const world = loadWorldPackById("split-world", { contentDir });

    expect(result.ok).toBe(true);
    expect(world.cities[0]?.entryRoles).toHaveLength(3);
    expect(world.cities[0]?.scenes[0]?.actionIds).toEqual(["split-action"]);
  });
});
