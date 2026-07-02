import { optionalText, requiredNumber, requiredText } from "./form";
import { asRecord, findEditableRecord, updateNumericRecord } from "./records";
import { failure, success } from "./result";
import type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function applyCityPatch(
  world: StructuredRecord,
  target: string,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult | null {
  if (!isCityEditTarget(target)) {
    return null;
  }

  const city = findEditableRecord(
    world,
    "cities",
    requiredText(formData, "cityId"),
    "city",
  );
  if ("error" in city) {
    return city.error;
  }

  if (target === "city") {
    city.record["name"] = requiredText(formData, "name");
    city.record["description"] = optionalText(formData, "description");
    city.record["initialState"] = updateNumericRecord(
      asRecord(city.record["initialState"]),
      formData,
      "initialStateKey",
      "initialState",
    );
    return success("City module saved and validated.");
  }

  if (target === "scene") {
    return applyScenePatch(city.record, formData);
  }

  if (target === "action") {
    return applyActionPatch(city.record, formData);
  }

  if (target === "anchorVariant") {
    return applyAnchorVariantPatch(city.record, formData);
  }

  return failure("Unknown structured edit target.");
}

function isCityEditTarget(target: string): boolean {
  return (
    target === "city" ||
    target === "scene" ||
    target === "action" ||
    target === "anchorVariant"
  );
}

function applyScenePatch(
  city: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const scene = findEditableRecord(
    city,
    "scenes",
    requiredText(formData, "sceneId"),
    "scene",
  );
  if ("error" in scene) {
    return scene.error;
  }

  scene.record["title"] = requiredText(formData, "title");
  scene.record["body"] = requiredText(formData, "body");
  return success("Scene saved and validated.");
}

function applyActionPatch(
  city: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const action = findEditableRecord(
    city,
    "placeholderActions",
    requiredText(formData, "actionId"),
    "placeholder action",
  );
  if ("error" in action) {
    return action.error;
  }

  const trace = asRecord(action.record["trace"]);
  if (!trace) {
    return failure("Selected action has no editable trace object.");
  }

  action.record["label"] = requiredText(formData, "label");
  trace["weight"] = requiredNumber(formData, "weight");
  trace["effects"] = updateNumericRecord(
    asRecord(trace["effects"]),
    formData,
    "effectKey",
    "effect",
  );
  action.record["trace"] = trace;
  return success("Action saved and validated.");
}

function applyAnchorVariantPatch(
  city: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const anchor = findEditableRecord(
    city,
    "anchors",
    requiredText(formData, "anchorId"),
    "anchor",
  );
  if ("error" in anchor) {
    return anchor.error;
  }

  const variant = findEditableRecord(
    anchor.record,
    "variants",
    requiredText(formData, "variantId"),
    "anchor variant",
  );
  if ("error" in variant) {
    return variant.error;
  }

  variant.record["title"] = requiredText(formData, "title");
  variant.record["traceConditions"] = readTraceConditions(formData);
  variant.record["effects"] = updateNumericRecord(
    asRecord(variant.record["effects"]),
    formData,
    "effectKey",
    "effect",
  );
  return success("Anchor variant saved and validated.");
}

function readTraceConditions(
  formData: StructuredPatchInput,
): StructuredRecord[] {
  const minCounts = formData.getAll("traceConditionMinCount").map(String);
  const types = formData.getAll("traceConditionType").map(String);
  const visibilities = formData.getAll("traceConditionVisibility").map(String);

  return minCounts.map((minCount, index) => ({
    ...(types[index] ? { type: types[index] } : {}),
    ...(visibilities[index] ? { visibility: visibilities[index] } : {}),
    minCount: Number(minCount),
  }));
}
