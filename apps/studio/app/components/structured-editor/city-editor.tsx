import type {
  AnchorEvent,
  CityModule,
  PlaceholderAction,
  Scene,
} from "@lacuna-engine/schema";
import {
  NumberField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./fields";
import {
  anchorGroupStyle,
  compactFormStyle,
  compactTitleStyle,
  conditionGroupStyle,
  detailsStyle,
  fieldGridStyle,
  formStyle,
  mutedStyle,
  subsectionGridStyle,
  summaryStyle,
} from "./styles";
import type { StructuredEditorFormProps } from "./types";

export function CityEditor({
  worldId,
  city,
  action,
  isPending,
}: {
  worldId: string;
  city: CityModule;
} & StructuredEditorFormProps) {
  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>{city.name}</summary>

      <form action={action} style={formStyle}>
        <input type="hidden" name="target" value="city" />
        <input type="hidden" name="worldId" value={worldId} />
        <input type="hidden" name="cityId" value={city.id} />
        <div style={fieldGridStyle}>
          <TextField label="City Name" name="name" defaultValue={city.name} />
          {Object.entries(city.initialState).map(([key, value]) => (
            <NumberField
              key={key}
              label={`State: ${key}`}
              name={`initialState:${key}`}
              hiddenName="initialStateKey"
              hiddenValue={key}
              defaultValue={value}
            />
          ))}
        </div>
        <TextAreaField
          label="Description"
          name="description"
          defaultValue={city.description ?? ""}
          rows={2}
        />
        <SubmitButton label="Save City" isPending={isPending} />
      </form>

      <div style={subsectionGridStyle}>
        {city.scenes.map((scene) => (
          <SceneForm
            key={scene.id}
            worldId={worldId}
            cityId={city.id}
            scene={scene}
            action={action}
            isPending={isPending}
          />
        ))}

        {city.placeholderActions.map((placeholderAction) => (
          <ActionForm
            key={placeholderAction.id}
            worldId={worldId}
            cityId={city.id}
            placeholderAction={placeholderAction}
            action={action}
            isPending={isPending}
          />
        ))}

        {city.anchors.map((anchor) => (
          <AnchorForm
            key={anchor.id}
            worldId={worldId}
            cityId={city.id}
            anchor={anchor}
            action={action}
            isPending={isPending}
          />
        ))}
      </div>
    </details>
  );
}

function SceneForm({
  worldId,
  cityId,
  scene,
  action,
  isPending,
}: {
  worldId: string;
  cityId: string;
  scene: Scene;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="scene" />
      <input type="hidden" name="worldId" value={worldId} />
      <input type="hidden" name="cityId" value={cityId} />
      <input type="hidden" name="sceneId" value={scene.id} />
      <h4 style={compactTitleStyle}>Scene: {scene.id}</h4>
      <TextField label="Title" name="title" defaultValue={scene.title} />
      <TextAreaField
        label="Body"
        name="body"
        defaultValue={scene.body}
        rows={4}
      />
      <SubmitButton label="Save Scene" isPending={isPending} />
    </form>
  );
}

function ActionForm({
  worldId,
  cityId,
  placeholderAction,
  action,
  isPending,
}: {
  worldId: string;
  cityId: string;
  placeholderAction: PlaceholderAction;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="action" />
      <input type="hidden" name="worldId" value={worldId} />
      <input type="hidden" name="cityId" value={cityId} />
      <input type="hidden" name="actionId" value={placeholderAction.id} />
      <h4 style={compactTitleStyle}>Action: {placeholderAction.id}</h4>
      <TextField
        label="Label"
        name="label"
        defaultValue={placeholderAction.label}
      />
      <NumberField
        label="Trace Weight"
        name="weight"
        defaultValue={placeholderAction.trace.weight}
      />
      <EffectFields effects={placeholderAction.trace.effects} />
      <SubmitButton label="Save Action" isPending={isPending} />
    </form>
  );
}

function AnchorForm({
  worldId,
  cityId,
  anchor,
  action,
  isPending,
}: {
  worldId: string;
  cityId: string;
  anchor: AnchorEvent;
} & StructuredEditorFormProps) {
  return (
    <div style={anchorGroupStyle}>
      <h4 style={compactTitleStyle}>Anchor: {anchor.id}</h4>
      {anchor.variants.map((variant) => (
        <form key={variant.id} action={action} style={compactFormStyle}>
          <input type="hidden" name="target" value="anchorVariant" />
          <input type="hidden" name="worldId" value={worldId} />
          <input type="hidden" name="cityId" value={cityId} />
          <input type="hidden" name="anchorId" value={anchor.id} />
          <input type="hidden" name="variantId" value={variant.id} />
          <TextField
            label="Variant Title"
            name="title"
            defaultValue={variant.title}
          />
          <TraceConditionFields traceConditions={variant.traceConditions} />
          <EffectFields effects={variant.effects} />
          <SubmitButton label="Save Variant" isPending={isPending} />
        </form>
      ))}
    </div>
  );
}

function EffectFields({ effects }: { effects: Record<string, number> }) {
  const entries = Object.entries(effects);

  if (entries.length === 0) {
    return <p style={mutedStyle}>No numeric effects</p>;
  }

  return (
    <div style={fieldGridStyle}>
      {entries.map(([key, value]) => (
        <NumberField
          key={key}
          label={`Effect: ${key}`}
          name={`effect:${key}`}
          hiddenName="effectKey"
          hiddenValue={key}
          defaultValue={value}
        />
      ))}
    </div>
  );
}

function TraceConditionFields({
  traceConditions,
}: {
  traceConditions: Array<{
    type?: string;
    visibility?: string;
    minCount: number;
  }>;
}) {
  if (traceConditions.length === 0) {
    return <p style={mutedStyle}>No trace conditions</p>;
  }

  return (
    <div style={fieldGridStyle}>
      {traceConditions.map((condition, index) => (
        <div key={index} style={conditionGroupStyle}>
          <SelectField
            label="Trace Type"
            name="traceConditionType"
            defaultValue={condition.type ?? ""}
            options={[
              "",
              "archive",
              "witness",
              "survivor",
              "object",
              "rumor",
              "corpse",
              "location_state",
              "system_record",
            ]}
          />
          <SelectField
            label="Visibility"
            name="traceConditionVisibility"
            defaultValue={condition.visibility ?? ""}
            options={["", "hidden", "local", "public"]}
          />
          <NumberField
            label="Min Count"
            name="traceConditionMinCount"
            defaultValue={condition.minCount}
          />
        </div>
      ))}
    </div>
  );
}
