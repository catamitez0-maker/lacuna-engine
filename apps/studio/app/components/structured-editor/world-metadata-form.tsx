import type { WorldPack } from "@lacuna-engine/schema";
import { SubmitButton, TextAreaField, TextField } from "./fields";
import { checkboxStyle, fieldGridStyle, formStyle } from "./styles";
import type { StructuredEditorFormProps } from "./types";

export function WorldMetadataForm({
  world,
  action,
  isPending,
}: {
  world: WorldPack;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={formStyle}>
      <input type="hidden" name="target" value="world" />
      <input type="hidden" name="worldId" value={world.id} />
      <div style={fieldGridStyle}>
        <TextField label="Name" name="name" defaultValue={world.name} />
        <TextField
          label="Version"
          name="version"
          defaultValue={world.version}
        />
        <label style={checkboxStyle}>
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={world.enabled}
          />
          Enabled
        </label>
      </div>
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={world.description ?? ""}
        rows={2}
      />
      <SubmitButton label="Save World" isPending={isPending} />
    </form>
  );
}
