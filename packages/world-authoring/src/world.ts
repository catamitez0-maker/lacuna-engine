import { optionalText, requiredText } from "./form";
import { success } from "./result";
import type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function applyWorldMetadataPatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  world["name"] = requiredText(formData, "name");
  world["version"] = requiredText(formData, "version");
  world["description"] = optionalText(formData, "description");
  world["enabled"] = formData.get("enabled") === "on";
  return success("World metadata saved and validated.");
}
