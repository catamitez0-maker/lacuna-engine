"use client";

import { useActionState } from "react";
import {
  saveWorldPackSourceAction,
  type SaveWorldPackSourceState,
} from "../actions";
import type { ContentValidationIssue } from "@lacuna-engine/content-loader";

const initialState: SaveWorldPackSourceState = {
  ok: true,
  message: "",
  issues: [],
};

export function WorldSourceEditor({
  worldId,
  initialSource,
  initialIssues,
}: {
  worldId: string;
  initialSource: string;
  initialIssues: ContentValidationIssue[];
}) {
  const [state, formAction, isPending] = useActionState(
    saveWorldPackSourceAction,
    initialState,
  );
  const visibleIssues = state.issues.length > 0 ? state.issues : initialIssues;

  return (
    <form action={formAction} style={formStyle}>
      <input type="hidden" name="worldId" value={worldId} />
      <div style={editorHeaderStyle}>
        <label htmlFor={`${worldId}-source`} style={editorLabelStyle}>
          world.yaml
        </label>
        <button type="submit" disabled={isPending} style={buttonStyle}>
          {isPending ? "Saving" : "Save"}
        </button>
      </div>

      <textarea
        id={`${worldId}-source`}
        name="source"
        defaultValue={initialSource}
        spellCheck={false}
        style={textareaStyle}
      />

      {state.message ? (
        <p style={state.ok ? successStyle : errorStyle}>{state.message}</p>
      ) : null}
      {state.savedAt ? <p style={metaStyle}>Saved at {state.savedAt}</p> : null}

      {visibleIssues.length > 0 ? (
        <ul style={issueListStyle}>
          {visibleIssues.map((issue) => (
            <li key={`${issue.path ?? "root"}-${issue.message}`}>
              {issue.path ? `${issue.path}: ` : ""}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

const formStyle = {
  display: "grid",
  gap: 10,
};
const editorHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};
const editorLabelStyle = {
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};
const buttonStyle = {
  border: "1px solid #111318",
  borderRadius: 6,
  background: "#111318",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  padding: "8px 12px",
};
const textareaStyle = {
  width: "100%",
  minHeight: 360,
  boxSizing: "border-box" as const,
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  color: "#111318",
  background: "#f8fafc",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 12,
  lineHeight: 1.55,
  padding: 12,
  resize: "vertical" as const,
};
const successStyle = {
  margin: 0,
  color: "#166534",
  fontSize: 13,
  fontWeight: 700,
};
const errorStyle = {
  margin: 0,
  color: "#991b1b",
  fontSize: 13,
  fontWeight: 700,
};
const metaStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: 12,
};
const issueListStyle = {
  margin: 0,
  paddingLeft: 18,
  color: "#991b1b",
  fontSize: 13,
};
