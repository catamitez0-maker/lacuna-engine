import { listText, optionalNumber, optionalText, requiredText } from "./form";
import {
  deleteEditableRecord,
  editableRecordArray,
  findEditableRecord,
  moveEditableRecord,
  setOptionalNumber,
} from "./records";
import { failure, success } from "./result";
import type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function applyWorldRulePatch(
  world: StructuredRecord,
  target: string,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult | null {
  if (target === "constantCreate") {
    const constants = editableRecordArray(world, "constants", "constants");
    const id = requiredText(formData, "constantId");
    if (constants.some((constant) => constant["id"] === id)) {
      return failure(`World constant ${id} already exists.`);
    }

    constants.push({
      id,
      title: requiredText(formData, "title"),
      description: requiredText(formData, "description"),
      category: requiredText(formData, "category"),
      severity: requiredText(formData, "severity"),
    });
    return success("World constant created and validated.");
  }

  if (target === "constant") {
    return applyConstantPatch(world, formData);
  }

  if (target === "stateRuleCreate") {
    const stateRules = editableRecordArray(world, "stateRules", "stateRules");
    const id = requiredText(formData, "stateRuleId");
    if (stateRules.some((rule) => rule["id"] === id)) {
      return failure(`State rule ${id} already exists.`);
    }

    const stateRule: StructuredRecord = {
      id,
      title: requiredText(formData, "title"),
      description: optionalText(formData, "description"),
      stateKey: requiredText(formData, "stateKey"),
      enforcement: requiredText(formData, "enforcement"),
      constantRefs: listText(formData, "constantRefs"),
    };
    setOptionalNumber(stateRule, "min", optionalNumber(formData, "min"));
    setOptionalNumber(stateRule, "max", optionalNumber(formData, "max"));
    setOptionalNumber(
      stateRule,
      "maxDailyDelta",
      optionalNumber(formData, "maxDailyDelta"),
    );
    stateRules.push(stateRule);
    return success("State rule created and validated.");
  }

  if (target === "stateRule") {
    return applyStateRulePatch(world, formData);
  }

  return null;
}

function applyConstantPatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const constantId = requiredText(formData, "constantId");
  const intent = optionalText(formData, "intent") ?? "save";
  if (intent === "delete") {
    return deleteEditableRecord(
      world,
      "constants",
      constantId,
      "world constant",
      "World constant deleted and validated.",
    );
  }
  if (intent === "moveUp" || intent === "moveDown") {
    return moveEditableRecord(
      world,
      "constants",
      constantId,
      "world constant",
      intent === "moveUp" ? -1 : 1,
      "World constant reordered and validated.",
    );
  }

  const constant = findEditableRecord(
    world,
    "constants",
    constantId,
    "constant",
  );
  if ("error" in constant) {
    return constant.error;
  }

  constant.record["title"] = requiredText(formData, "title");
  constant.record["description"] = requiredText(formData, "description");
  constant.record["category"] = requiredText(formData, "category");
  constant.record["severity"] = requiredText(formData, "severity");
  return success("World constant saved and validated.");
}

function applyStateRulePatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const stateRuleId = requiredText(formData, "stateRuleId");
  const intent = optionalText(formData, "intent") ?? "save";
  if (intent === "delete") {
    return deleteEditableRecord(
      world,
      "stateRules",
      stateRuleId,
      "state rule",
      "State rule deleted and validated.",
    );
  }
  if (intent === "moveUp" || intent === "moveDown") {
    return moveEditableRecord(
      world,
      "stateRules",
      stateRuleId,
      "state rule",
      intent === "moveUp" ? -1 : 1,
      "State rule reordered and validated.",
    );
  }

  const stateRule = findEditableRecord(
    world,
    "stateRules",
    stateRuleId,
    "state rule",
  );
  if ("error" in stateRule) {
    return stateRule.error;
  }

  stateRule.record["title"] = requiredText(formData, "title");
  stateRule.record["description"] = optionalText(formData, "description");
  stateRule.record["stateKey"] = requiredText(formData, "stateKey");
  stateRule.record["enforcement"] = requiredText(formData, "enforcement");
  setOptionalNumber(stateRule.record, "min", optionalNumber(formData, "min"));
  setOptionalNumber(stateRule.record, "max", optionalNumber(formData, "max"));
  setOptionalNumber(
    stateRule.record,
    "maxDailyDelta",
    optionalNumber(formData, "maxDailyDelta"),
  );
  stateRule.record["constantRefs"] = listText(formData, "constantRefs");
  return success("State rule saved and validated.");
}
