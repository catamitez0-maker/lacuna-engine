import { applyCityPatch } from "./city";
import { applyWorldRulePatch } from "./rules";
import { applySpinePatch } from "./spine";
import type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";
import { applyWorldMetadataPatch } from "./world";
import { failure } from "./result";

export type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function safeApplyStructuredPatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  try {
    return applyStructuredPatch(world, formData);
  } catch (error) {
    return failure(error instanceof Error ? error.message : String(error));
  }
}

export function applyStructuredPatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const target = String(formData.get("target") ?? "");

  if (target === "world") {
    return applyWorldMetadataPatch(world, formData);
  }

  return (
    applyWorldRulePatch(world, target, formData) ??
    applySpinePatch(world, target, formData) ??
    applyCityPatch(world, target, formData) ??
    failure(`Unknown structured edit target ${target || "(empty)"}.`)
  );
}
