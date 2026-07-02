import type { StateRule, WorldConstant } from "@lacuna-engine/schema";
import {
  ListField,
  OptionalNumberField,
  RecordActionButtons,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "./fields";
import {
  compactFormStyle,
  compactTitleStyle,
  detailsStyle,
  fieldGridStyle,
  subsectionGridStyle,
  summaryStyle,
} from "./styles";
import type { StructuredEditorFormProps } from "./types";

export function WorldRuleEditor({
  worldId,
  constants,
  stateRules,
  action,
  isPending,
}: {
  worldId: string;
  constants: WorldConstant[];
  stateRules: StateRule[];
} & StructuredEditorFormProps) {
  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>World Rules</summary>
      <div style={subsectionGridStyle}>
        <ConstantCreateForm
          worldId={worldId}
          action={action}
          isPending={isPending}
        />

        {constants.map((constant) => (
          <ConstantForm
            key={constant.id}
            worldId={worldId}
            constant={constant}
            action={action}
            isPending={isPending}
          />
        ))}

        <StateRuleCreateForm
          worldId={worldId}
          action={action}
          isPending={isPending}
        />

        {stateRules.map((rule) => (
          <StateRuleForm
            key={rule.id}
            worldId={worldId}
            rule={rule}
            action={action}
            isPending={isPending}
          />
        ))}
      </div>
    </details>
  );
}

function ConstantCreateForm({
  worldId,
  action,
  isPending,
}: {
  worldId: string;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="constantCreate" />
      <input type="hidden" name="worldId" value={worldId} />
      <h4 style={compactTitleStyle}>Add Constant</h4>
      <TextField label="ID" name="constantId" defaultValue="" />
      <TextField label="Title" name="title" defaultValue="" />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue=""
        rows={3}
      />
      <SelectField
        label="Category"
        name="category"
        defaultValue="invariant"
        options={["invariant", "prohibition", "causal", "tone"]}
      />
      <SelectField
        label="Severity"
        name="severity"
        defaultValue="hard"
        options={["hard", "soft"]}
      />
      <SubmitButton label="Add Constant" isPending={isPending} />
    </form>
  );
}

function ConstantForm({
  worldId,
  constant,
  action,
  isPending,
}: {
  worldId: string;
  constant: WorldConstant;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="constant" />
      <input type="hidden" name="worldId" value={worldId} />
      <input type="hidden" name="constantId" value={constant.id} />
      <h4 style={compactTitleStyle}>Constant: {constant.id}</h4>
      <TextField label="Title" name="title" defaultValue={constant.title} />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={constant.description}
        rows={3}
      />
      <SelectField
        label="Category"
        name="category"
        defaultValue={constant.category}
        options={["invariant", "prohibition", "causal", "tone"]}
      />
      <SelectField
        label="Severity"
        name="severity"
        defaultValue={constant.severity}
        options={["hard", "soft"]}
      />
      <RecordActionButtons
        saveLabel="Save Constant"
        deleteLabel="Delete"
        isPending={isPending}
      />
    </form>
  );
}

function StateRuleCreateForm({
  worldId,
  action,
  isPending,
}: {
  worldId: string;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="stateRuleCreate" />
      <input type="hidden" name="worldId" value={worldId} />
      <h4 style={compactTitleStyle}>Add State Rule</h4>
      <TextField label="ID" name="stateRuleId" defaultValue="" />
      <TextField label="Title" name="title" defaultValue="" />
      <TextField label="State Key" name="stateKey" defaultValue="" />
      <SelectField
        label="Enforcement"
        name="enforcement"
        defaultValue="report"
        options={["report", "clamp", "reject"]}
      />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue=""
        rows={2}
      />
      <div style={fieldGridStyle}>
        <OptionalNumberField label="Min" name="min" />
        <OptionalNumberField label="Max" name="max" />
        <OptionalNumberField label="Max Daily Delta" name="maxDailyDelta" />
      </div>
      <ListField label="Constant Refs" name="constantRefs" defaultValue={[]} />
      <SubmitButton label="Add Rule" isPending={isPending} />
    </form>
  );
}

function StateRuleForm({
  worldId,
  rule,
  action,
  isPending,
}: {
  worldId: string;
  rule: StateRule;
} & StructuredEditorFormProps) {
  return (
    <form action={action} style={compactFormStyle}>
      <input type="hidden" name="target" value="stateRule" />
      <input type="hidden" name="worldId" value={worldId} />
      <input type="hidden" name="stateRuleId" value={rule.id} />
      <h4 style={compactTitleStyle}>State Rule: {rule.id}</h4>
      <TextField label="Title" name="title" defaultValue={rule.title} />
      <TextField
        label="State Key"
        name="stateKey"
        defaultValue={rule.stateKey}
      />
      <SelectField
        label="Enforcement"
        name="enforcement"
        defaultValue={rule.enforcement}
        options={["report", "clamp", "reject"]}
      />
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={rule.description ?? ""}
        rows={2}
      />
      <div style={fieldGridStyle}>
        <OptionalNumberField label="Min" name="min" defaultValue={rule.min} />
        <OptionalNumberField label="Max" name="max" defaultValue={rule.max} />
        <OptionalNumberField
          label="Max Daily Delta"
          name="maxDailyDelta"
          defaultValue={rule.maxDailyDelta}
        />
      </div>
      <ListField
        label="Constant Refs"
        name="constantRefs"
        defaultValue={rule.constantRefs}
      />
      <RecordActionButtons
        saveLabel="Save Rule"
        deleteLabel="Delete"
        isPending={isPending}
      />
    </form>
  );
}
