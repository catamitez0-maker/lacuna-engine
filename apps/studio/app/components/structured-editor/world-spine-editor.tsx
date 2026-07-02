import type { SpinePhase, WorldPack } from "@lacuna-engine/schema";
import {
  ListField,
  NumberField,
  RecordActionButtons,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./fields";
import {
  compactFormStyle,
  compactTitleStyle,
  detailsStyle,
  formStyle,
  subsectionGridStyle,
  summaryStyle,
} from "./styles";
import type { StructuredEditorFormProps } from "./types";

export function WorldSpineEditor({
  worldId,
  spine,
  action,
  isPending,
}: {
  worldId: string;
  spine: NonNullable<WorldPack["spine"]>;
} & StructuredEditorFormProps) {
  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>World Spine</summary>
      <form action={action} style={formStyle}>
        <input type="hidden" name="target" value="spine" />
        <input type="hidden" name="worldId" value={worldId} />
        <TextAreaField
          label="Premise"
          name="premise"
          defaultValue={spine.premise}
          rows={3}
        />
        <TextField
          label="Current Era"
          name="currentEra"
          defaultValue={spine.currentEra ?? ""}
        />
        <TextAreaField
          label="Central Conflict"
          name="centralConflict"
          defaultValue={spine.centralConflict ?? ""}
          rows={3}
        />
        <ListField
          label="Fixed Anchor IDs"
          name="fixedAnchorIds"
          defaultValue={spine.fixedAnchorIds}
        />
        <SubmitButton label="Save Spine" isPending={isPending} />
      </form>

      <div style={subsectionGridStyle}>
        <SpinePhaseCreateForm
          worldId={worldId}
          action={action}
          isPending={isPending}
        />

        {spine.phases.map((phase) => (
          <SpinePhaseForm
            key={phase.id}
            worldId={worldId}
            phase={phase}
            action={action}
            isPending={isPending}
          />
        ))}
      </div>
    </details>
  );
}

export function WorldSpineCreateForm({
  worldId,
  action,
  isPending,
}: {
  worldId: string;
} & StructuredEditorFormProps) {
  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>World Spine</summary>
      <form action={action} style={formStyle}>
        <input type="hidden" name="target" value="spineCreate" />
        <input type="hidden" name="worldId" value={worldId} />
        <TextAreaField
          label="Premise"
          name="premise"
          defaultValue=""
          rows={3}
        />
        <TextField label="Current Era" name="currentEra" defaultValue="" />
        <TextAreaField
          label="Central Conflict"
          name="centralConflict"
          defaultValue=""
          rows={3}
        />
        <ListField
          label="Fixed Anchor IDs"
          name="fixedAnchorIds"
          defaultValue={[]}
        />
        <SubmitButton label="Create Spine" isPending={isPending} />
      </form>
    </details>
  );
}

function SpinePhaseCreateForm({
  worldId,
  action,
  isPending,
}: {
  worldId: string;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="spinePhaseCreate" />
      <input type="hidden" name="worldId" value={worldId} />
      <h4 style={compactTitleStyle}>Add Phase</h4>
      <TextField label="ID" name="phaseId" defaultValue="" />
      <TextField label="Title" name="title" defaultValue="" />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue=""
        rows={2}
      />
      <ListField label="Anchor IDs" name="anchorIds" defaultValue={[]} />
      <SubmitButton label="Add Phase" isPending={isPending} />
    </form>
  );
}

function SpinePhaseForm({
  worldId,
  phase,
  action,
  isPending,
}: {
  worldId: string;
  phase: SpinePhase;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="spinePhase" />
      <input type="hidden" name="worldId" value={worldId} />
      <input type="hidden" name="phaseId" value={phase.id} />
      <h4 style={compactTitleStyle}>Phase: {phase.id}</h4>
      <TextField label="Title" name="title" defaultValue={phase.title} />
      <NumberField label="Order" name="order" defaultValue={phase.order} />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={phase.description ?? ""}
        rows={2}
      />
      <ListField
        label="Anchor IDs"
        name="anchorIds"
        defaultValue={phase.anchorIds}
      />
      <RecordActionButtons
        saveLabel="Save Phase"
        deleteLabel="Delete"
        isPending={isPending}
      />
    </form>
  );
}
