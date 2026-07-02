import {
  actionRowStyle,
  buttonStyle,
  destructiveButtonStyle,
  inputStyle,
  labelStyle,
  secondaryButtonStyle,
  textareaStyle,
} from "./styles";

export function TextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input name={name} defaultValue={defaultValue} style={inputStyle} />
    </label>
  );
}

export function NumberField({
  label,
  name,
  defaultValue,
  hiddenName,
  hiddenValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
  hiddenName?: string;
  hiddenValue?: string;
}) {
  return (
    <label style={labelStyle}>
      {hiddenName && hiddenValue ? (
        <input type="hidden" name={hiddenName} value={hiddenValue} />
      ) : null}
      {label}
      <input
        name={name}
        type="number"
        step="any"
        defaultValue={String(defaultValue)}
        style={inputStyle}
      />
    </label>
  );
}

export function OptionalNumberField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: number;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        name={name}
        type="number"
        step="any"
        defaultValue={defaultValue === undefined ? "" : String(defaultValue)}
        style={inputStyle}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label style={labelStyle}>
      {label}
      <select name={name} defaultValue={defaultValue} style={inputStyle}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ListField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string[];
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input
        name={name}
        defaultValue={defaultValue.join(", ")}
        style={inputStyle}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <label style={labelStyle}>
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        style={textareaStyle}
      />
    </label>
  );
}

export function RecordActionButtons({
  saveLabel,
  deleteLabel,
  isPending,
}: {
  saveLabel: string;
  deleteLabel: string;
  isPending: boolean;
}) {
  return (
    <div style={actionRowStyle}>
      <SubmitButton
        label={saveLabel}
        isPending={isPending}
        name="intent"
        value="save"
      />
      <SubmitButton
        label="Move Up"
        isPending={isPending}
        name="intent"
        value="moveUp"
        variant="secondary"
      />
      <SubmitButton
        label="Move Down"
        isPending={isPending}
        name="intent"
        value="moveDown"
        variant="secondary"
      />
      <SubmitButton
        label={deleteLabel}
        isPending={isPending}
        name="intent"
        value="delete"
        variant="destructive"
      />
    </div>
  );
}

export function SubmitButton({
  label,
  isPending,
  name,
  value,
  variant = "primary",
}: {
  label: string;
  isPending: boolean;
  name?: string;
  value?: string;
  variant?: "primary" | "secondary" | "destructive";
}) {
  const style =
    variant === "secondary"
      ? secondaryButtonStyle
      : variant === "destructive"
        ? destructiveButtonStyle
        : buttonStyle;

  return (
    <button
      type="submit"
      disabled={isPending}
      name={name}
      value={value}
      style={style}
    >
      {isPending ? "Saving" : label}
    </button>
  );
}
