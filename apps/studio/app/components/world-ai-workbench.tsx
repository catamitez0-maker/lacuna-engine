"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createManualAiProposalReview,
  createMockAiStewardAgent,
  createMockNpcAgent,
  type AiProposal,
  type AiProposalReview,
  type AiStewardPlan,
  type AiStewardTask,
  type ExtensionResult,
  type NpcActionProposal,
} from "@lacuna-engine/extension-api";
import type { WorldPack } from "@lacuna-engine/schema";

const STEWARD_TASKS: AiStewardTask[] = [
  "world_health_check",
  "rule_consistency_review",
  "spine_gap_analysis",
  "simulation_interpretation",
  "content_patch_suggestion",
];

type StewardProposal = ExtensionResult<AiProposal<AiStewardPlan>>;
type NpcProposal = ExtensionResult<AiProposal<NpcActionProposal>>;

export function WorldAiWorkbench({ world }: { world: WorldPack }) {
  const city = world.cities[0];
  const actions = city?.placeholderActions ?? [];
  const steward = useMemo(() => createMockAiStewardAgent(), []);
  const npcAgent = useMemo(() => createMockNpcAgent(), []);
  const [task, setTask] = useState<AiStewardTask>("world_health_check");
  const [stewardProposal, setStewardProposal] =
    useState<StewardProposal | null>(null);
  const [review, setReview] = useState<AiProposalReview | null>(null);
  const [npcId, setNpcId] = useState("placeholder-npc");
  const [objective, setObjective] = useState("observe");
  const [actionId, setActionId] = useState(actions[0]?.id ?? "");
  const [npcProposal, setNpcProposal] = useState<NpcProposal | null>(null);

  const selectedActionId = actions.some((action) => action.id === actionId)
    ? actionId
    : (actions[0]?.id ?? "");

  useEffect(() => {
    let isCurrent = true;

    steward.propose({ world, city, task }).then((result) => {
      if (!isCurrent) {
        return;
      }

      setStewardProposal(result);
      setReview(createManualAiProposalReview(result.payload));
    });

    return () => {
      isCurrent = false;
    };
  }, [city, steward, task, world]);

  useEffect(() => {
    let isCurrent = true;

    npcAgent
      .proposeAction({
        world,
        city,
        npcId,
        objective,
        availableActionIds: selectedActionId ? [selectedActionId] : [],
        constraints: {
          constants: world.constants,
          stateRules: world.stateRules,
          anchor: city?.anchors[0],
        },
      })
      .then((result) => {
        if (isCurrent) {
          setNpcProposal(result);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [city, npcAgent, npcId, objective, selectedActionId, world]);

  if (!city) {
    return null;
  }

  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>AI Workbench</summary>

      <div style={toolbarStyle}>
        <label style={labelStyle}>
          Steward Task
          <select
            value={task}
            onChange={(event) => setTask(event.target.value as AiStewardTask)}
            style={inputStyle}
          >
            {STEWARD_TASKS.map((candidate) => (
              <option key={candidate} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          NPC ID
          <input
            value={npcId}
            onChange={(event) => setNpcId(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Objective
          <input
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          NPC Action
          <select
            value={selectedActionId}
            onChange={(event) => setActionId(event.target.value)}
            style={inputStyle}
          >
            {actions.map((action) => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={resultGridStyle}>
        <section style={panelStyle}>
          <h4 style={panelTitleStyle}>Steward Proposal</h4>
          {stewardProposal ? (
            <>
              <p style={bodyStyle}>{stewardProposal.payload.summary}</p>
              <ul style={listStyle}>
                {stewardProposal.payload.payload.suggestions.map(
                  (suggestion, index) => (
                    <li
                      key={`${suggestion.kind}-${suggestion.targetId ?? index}`}
                    >
                      {suggestion.priority} / {suggestion.kind}
                      {suggestion.targetId
                        ? ` / ${suggestion.targetId}`
                        : ""}: {suggestion.rationale}
                      {suggestion.proposedPatch ? (
                        <pre style={codeStyle}>
                          {JSON.stringify(suggestion.proposedPatch, null, 2)}
                        </pre>
                      ) : null}
                    </li>
                  ),
                )}
              </ul>
            </>
          ) : (
            <p style={bodyStyle}>pending</p>
          )}
        </section>

        <section style={panelStyle}>
          <h4 style={panelTitleStyle}>Proposal Review</h4>
          {review ? (
            <>
              <dl style={metaGridStyle}>
                <Metric label="Status" value={review.status} />
                <Metric
                  label="Can Apply"
                  value={review.canApply ? "yes" : "no"}
                />
                <Metric
                  label="Patch Count"
                  value={String(review.proposedPatchCount)}
                />
              </dl>
              <ul style={listStyle}>
                {review.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </>
          ) : (
            <p style={bodyStyle}>pending</p>
          )}
        </section>

        <section style={panelStyle}>
          <h4 style={panelTitleStyle}>NPC Proposal</h4>
          {npcProposal ? (
            <>
              <dl style={metaGridStyle}>
                <Metric
                  label="Action"
                  value={npcProposal.payload.payload.actionId ?? "none"}
                />
                <Metric
                  label="Intent"
                  value={npcProposal.payload.payload.intent}
                />
                <Metric
                  label="Visibility"
                  value={npcProposal.payload.payload.visibility ?? "none"}
                />
              </dl>
              <p style={bodyStyle}>{npcProposal.payload.payload.dialogue}</p>
              <p style={bodyStyle}>{npcProposal.payload.payload.rationale}</p>
              <pre style={codeStyle}>
                {JSON.stringify(
                  npcProposal.payload.payload.traceEffects ?? {},
                  null,
                  2,
                )}
              </pre>
            </>
          ) : (
            <p style={bodyStyle}>pending</p>
          )}
        </section>
      </div>
    </details>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={termStyle}>{label}</dt>
      <dd style={descStyle}>{value || "none"}</dd>
    </div>
  );
}

const detailsStyle = {
  display: "grid",
  gap: 12,
  borderTop: "1px solid #d9d4ca",
  paddingTop: 10,
};
const summaryStyle = {
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 800,
};
const toolbarStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
  gap: 10,
};
const resultGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
  gap: 12,
};
const panelStyle = {
  border: "1px solid #d9d4ca",
  borderRadius: 6,
  display: "grid",
  gap: 8,
  padding: 12,
};
const panelTitleStyle = {
  margin: 0,
  color: "#334155",
  fontSize: 13,
};
const labelStyle = {
  color: "#475569",
  display: "grid",
  fontSize: 12,
  fontWeight: 700,
  gap: 5,
};
const inputStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  color: "#111318",
  fontSize: 13,
  padding: "8px 9px",
};
const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 8,
  margin: 0,
};
const termStyle = { color: "#64748b", fontSize: 12, fontWeight: 700 };
const descStyle = { margin: "4px 0 0", color: "#111318", fontSize: 13 };
const bodyStyle = {
  margin: 0,
  color: "#475569",
  fontSize: 13,
  lineHeight: 1.5,
};
const listStyle = {
  margin: 0,
  paddingLeft: 18,
  color: "#475569",
  fontSize: 13,
  lineHeight: 1.5,
};
const codeStyle = {
  margin: "6px 0 0",
  overflowX: "auto" as const,
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  background: "#f8fafc",
  color: "#334155",
  fontSize: 12,
  padding: 8,
};
