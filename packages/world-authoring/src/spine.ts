import { listText, optionalText, requiredNumber, requiredText } from "./form";
import {
  asRecord,
  deleteEditableRecord,
  editableRecordArray,
  findEditableRecord,
  moveEditableRecord,
  nextPhaseOrder,
} from "./records";
import { failure, success } from "./result";
import type {
  ApplyStructuredPatchResult,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function applySpinePatch(
  world: StructuredRecord,
  target: string,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult | null {
  if (target === "spineCreate") {
    if (asRecord(world["spine"])) {
      return failure("World spine already exists.");
    }

    world["spine"] = {
      premise: requiredText(formData, "premise"),
      currentEra: optionalText(formData, "currentEra"),
      centralConflict: optionalText(formData, "centralConflict"),
      fixedAnchorIds: listText(formData, "fixedAnchorIds"),
      phases: [],
    };
    return success("World spine created and validated.");
  }

  if (target === "spine") {
    const spine = asRecord(world["spine"]);
    if (!spine) {
      return failure("World spine is not editable in world.yaml.");
    }

    spine["premise"] = requiredText(formData, "premise");
    spine["currentEra"] = optionalText(formData, "currentEra");
    spine["centralConflict"] = optionalText(formData, "centralConflict");
    spine["fixedAnchorIds"] = listText(formData, "fixedAnchorIds");
    world["spine"] = spine;
    return success("World spine saved and validated.");
  }

  if (target === "spinePhaseCreate") {
    const spine = asRecord(world["spine"]);
    if (!spine) {
      return failure("World spine is not editable in world.yaml.");
    }

    const phases = editableRecordArray(spine, "phases", "spine phases");
    const id = requiredText(formData, "phaseId");
    if (phases.some((phase) => phase["id"] === id)) {
      return failure(`Spine phase ${id} already exists.`);
    }

    phases.push({
      id,
      title: requiredText(formData, "title"),
      description: optionalText(formData, "description"),
      order: nextPhaseOrder(phases),
      anchorIds: listText(formData, "anchorIds"),
    });
    return success("Spine phase created and validated.");
  }

  if (target === "spinePhase") {
    return applySpinePhasePatch(world, formData);
  }

  return null;
}

function applySpinePhasePatch(
  world: StructuredRecord,
  formData: StructuredPatchInput,
): ApplyStructuredPatchResult {
  const spine = asRecord(world["spine"]);
  if (!spine) {
    return failure("World spine is not editable in world.yaml.");
  }

  const phaseId = requiredText(formData, "phaseId");
  const intent = optionalText(formData, "intent") ?? "save";
  if (intent === "delete") {
    return deleteEditableRecord(
      spine,
      "phases",
      phaseId,
      "spine phase",
      "Spine phase deleted and validated.",
      { renumberOrder: true },
    );
  }
  if (intent === "moveUp" || intent === "moveDown") {
    return moveEditableRecord(
      spine,
      "phases",
      phaseId,
      "spine phase",
      intent === "moveUp" ? -1 : 1,
      "Spine phase reordered and validated.",
      { renumberOrder: true },
    );
  }

  const phase = findEditableRecord(spine, "phases", phaseId, "spine phase");
  if ("error" in phase) {
    return phase.error;
  }

  phase.record["title"] = requiredText(formData, "title");
  phase.record["description"] = optionalText(formData, "description");
  phase.record["order"] = requiredNumber(formData, "order");
  phase.record["anchorIds"] = listText(formData, "anchorIds");
  return success("Spine phase saved and validated.");
}
