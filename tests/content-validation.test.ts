import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateWorldPackSource } from "@lacuna-engine/content-loader";
import { validateWorldPackById } from "@lacuna-engine/content-loader/server";

describe("content validation", () => {
  it("validates inline World Pack source without the server loader", () => {
    const result = validateWorldPackSource(validWorldYaml(), {
      worldId: "validation-world",
    });

    expect(result.ok).toBe(true);
    expect(result.world?.cities[0]?.id).toBe("validation-city");
  });

  it("rejects unsupported World Pack schema versions", () => {
    const contentDir = mkdtempSync(join(tmpdir(), "lacuna-invalid-version-"));
    writeWorld(contentDir, validWorldYaml({ schemaVersion: "9.9.9" }));

    const result = validateWorldPackById("validation-world", { contentDir });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.path)).toContain("schemaVersion");
  });

  it("rejects trace effects that are not declared in stateSchema", () => {
    const contentDir = mkdtempSync(join(tmpdir(), "lacuna-invalid-state-"));
    writeWorld(
      contentDir,
      validWorldYaml({
        actionEffects: "            missing_state_key: 1\n",
      }),
    );

    const result = validateWorldPackById("validation-world", { contentDir });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "placeholderAction validation-action trace effect key missing_state_key is not declared in stateSchema",
    );
  });

  it("rejects state rules that use undeclared state keys", () => {
    const contentDir = mkdtempSync(
      join(tmpdir(), "lacuna-invalid-state-rule-"),
    );
    writeWorld(
      contentDir,
      validWorldYaml({
        worldExtras:
          "stateRules:\n  - id: invalid-state-rule\n    title: Invalid State Rule\n    stateKey: missing_state_key\n",
      }),
    );

    const result = validateWorldPackById("validation-world", { contentDir });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "stateRule invalid-state-rule stateKey missing_state_key is not declared in stateSchema",
    );
  });

  it("rejects event references to missing world constants", () => {
    const contentDir = mkdtempSync(join(tmpdir(), "lacuna-invalid-constant-"));
    writeWorld(
      contentDir,
      validWorldYaml({
        anchorExtras: "        constantRefs:\n          - missing-constant\n",
      }),
    );

    const result = validateWorldPackById("validation-world", { contentDir });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "anchor validation-anchor constantRefs references missing id missing-constant",
    );
  });

  it("rejects spine references to missing anchors", () => {
    const contentDir = mkdtempSync(join(tmpdir(), "lacuna-invalid-spine-"));
    writeWorld(
      contentDir,
      validWorldYaml({
        worldExtras:
          "spine:\n  premise: Validation premise.\n  fixedAnchorIds:\n    - missing-anchor\n",
      }),
    );

    const result = validateWorldPackById("validation-world", { contentDir });

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "spine fixedAnchorIds references missing id missing-anchor",
    );
  });
});

function writeWorld(contentDir: string, source: string): void {
  const worldDir = join(contentDir, "validation-world");
  mkdirSync(worldDir, { recursive: true });
  writeFileSync(join(worldDir, "world.yaml"), source);
}

function validWorldYaml({
  schemaVersion = "0.1.0",
  worldExtras = "",
  anchorExtras = "",
  variantExtras = "",
  actionEffects = "            trace_weight: 1\n",
}: {
  schemaVersion?: string;
  worldExtras?: string;
  anchorExtras?: string;
  variantExtras?: string;
  actionEffects?: string;
} = {}): string {
  return `id: validation-world
name: Validation World
schemaVersion: ${schemaVersion}
version: 0.1.0
enabled: false
${worldExtras}\
cities:
  - id: validation-city
    name: Validation City
    stateSchema:
      continuity:
        type: number
      trace_weight:
        type: number
    initialState:
      continuity: 0
      trace_weight: 0
    entryRoles:
      - id: validation-role-a
        title: Role A
        entryDayId: validation-day
        entrySceneId: validation-scene
        influenceRadius: personal
      - id: validation-role-b
        title: Role B
        entryDayId: validation-day
        entrySceneId: validation-scene
        influenceRadius: local
      - id: validation-role-c
        title: Role C
        entryDayId: validation-day
        entrySceneId: validation-scene
        influenceRadius: regional
    identityFragments:
      - id: validation-fragment-a
        label: Fragment A
        description: Fragment A.
        mappedRoleId: validation-role-a
        weight: 1
      - id: validation-fragment-b
        label: Fragment B
        description: Fragment B.
        mappedRoleId: validation-role-b
        weight: 1
      - id: validation-fragment-c
        label: Fragment C
        description: Fragment C.
        mappedRoleId: validation-role-c
        weight: 1
    days:
      - id: validation-day
        cityId: validation-city
        title: Validation Day
        order: 1
        anchorId: validation-anchor
    anchors:
      - id: validation-anchor
        cityId: validation-city
        dayId: validation-day
        title: Validation Anchor
        fixed: true
${anchorExtras}\
        variants:
          - id: validation-variant
            title: Validation Variant
${variantExtras}\
            conditions:
              - key: continuity
                operator: ">="
                value: 0
            effects:
              continuity: 1
    scenes:
      - id: validation-scene
        cityId: validation-city
        dayId: validation-day
        title: Validation Scene
        body: Validation scene body.
        actionIds:
          - validation-action
    prologueActions:
      - id: validation-observe
        label: observe
        tendency: observe
      - id: validation-help
        label: help
        tendency: help
      - id: validation-hide
        label: hide
        tendency: hide
    placeholderActions:
      - id: validation-action
        label: validation action
        trace:
          type: system_record
          visibility: local
          weight: 1
          effects:
${actionEffects}`;
}
