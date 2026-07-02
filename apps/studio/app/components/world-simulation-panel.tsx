"use client";

import { useMemo, useState } from "react";
import {
  createPlayerTimelineFromFragment,
  createRuntimeSession,
  listIdentityFragments,
  performRuntimeAction,
  selectPrologueAction,
  settleRuntimeSessionPulse,
} from "@lacuna-engine/narrative-runtime";
import type {
  DailyPulse,
  ObserverReport,
  WorldPack,
} from "@lacuna-engine/schema";

const SIMULATION_TIMESTAMP = "2026-01-01T00:00:00.000Z";

type SimulationResult =
  | {
      ok: true;
      pulse: DailyPulse;
      observerReport: ObserverReport;
      traceCount: number;
    }
  | {
      ok: false;
      message: string;
    };

export function WorldSimulationPanel({ world }: { world: WorldPack }) {
  const city = world.cities[0];
  const prologueAction = city?.prologueActions[0];
  const actions = city?.placeholderActions ?? [];
  const [actionId, setActionId] = useState(actions[0]?.id ?? "");

  const prologueRecord = useMemo(() => {
    if (!city || !prologueAction) {
      return null;
    }

    try {
      return selectPrologueAction(city, prologueAction.id);
    } catch {
      return null;
    }
  }, [city, prologueAction]);
  const fragments = useMemo(
    () =>
      city && prologueRecord
        ? listIdentityFragments(city, [prologueRecord])
        : [],
    [city, prologueRecord],
  );
  const maxPlayers = Math.max(1, fragments.length);
  const [playerCount, setPlayerCount] = useState(Math.min(2, maxPlayers));
  const selectedActionId = actions.some((action) => action.id === actionId)
    ? actionId
    : (actions[0]?.id ?? "");
  const boundedPlayerCount = Math.min(Math.max(1, playerCount), maxPlayers);
  const result = useMemo(
    () =>
      runSimulation({
        world,
        actionId: selectedActionId,
        playerCount: boundedPlayerCount,
      }),
    [world, selectedActionId, boundedPlayerCount],
  );

  if (!city) {
    return null;
  }

  return (
    <details open style={detailsStyle}>
      <summary style={summaryStyle}>Simulation</summary>
      <div style={toolbarStyle}>
        <label style={labelStyle}>
          Action
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
        <label style={labelStyle}>
          Players
          <input
            type="number"
            min={1}
            max={maxPlayers}
            value={boundedPlayerCount}
            onChange={(event) => setPlayerCount(Number(event.target.value))}
            style={inputStyle}
          />
        </label>
      </div>

      {result.ok ? (
        <div style={resultGridStyle}>
          <section style={panelStyle}>
            <h4 style={panelTitleStyle}>State Delta</h4>
            <table style={tableStyle}>
              <tbody>
                {stateRows(result.pulse).map((row) => (
                  <tr key={row.key}>
                    <th style={tableHeaderStyle}>{row.key}</th>
                    <td style={tableCellStyle}>{row.before}</td>
                    <td style={tableCellStyle}>{row.after}</td>
                    <td style={deltaCellStyle(row.delta)}>
                      {formatDelta(row.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section style={panelStyle}>
            <h4 style={panelTitleStyle}>Selected Variants</h4>
            <p style={bodyStyle}>
              {result.pulse.selectedVariantIds.length > 0
                ? result.pulse.selectedVariantIds.join(", ")
                : "none"}
            </p>
            <h4 style={panelTitleStyle}>Traces</h4>
            <p style={bodyStyle}>{result.traceCount}</p>
          </section>

          <section style={panelStyle}>
            <h4 style={panelTitleStyle}>Rule Audit</h4>
            {result.pulse.ruleAudit.length > 0 ? (
              <ul style={listStyle}>
                {result.pulse.ruleAudit.map((entry) => (
                  <li key={entry.ruleId}>
                    {entry.ruleId}: {entry.outcome}
                    {entry.messages.length > 0
                      ? ` (${entry.messages.join("; ")})`
                      : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={bodyStyle}>none</p>
            )}
          </section>

          <section style={panelStyle}>
            <h4 style={panelTitleStyle}>Observer</h4>
            <ul style={listStyle}>
              {[
                ...result.observerReport.traceSummary,
                ...result.observerReport.ruleAuditSummary,
              ].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <p style={errorStyle}>{result.message}</p>
      )}
    </details>
  );
}

function runSimulation({
  world,
  actionId,
  playerCount,
}: {
  world: WorldPack;
  actionId: string;
  playerCount: number;
}): SimulationResult {
  try {
    const city = world.cities[0];
    if (!city) {
      return { ok: false, message: "World has no city module." };
    }

    const prologueAction = city.prologueActions[0];
    if (!prologueAction) {
      return { ok: false, message: "City has no prologue action." };
    }

    const action = city.placeholderActions.find(
      (candidate) => candidate.id === actionId,
    );
    if (!action) {
      return { ok: false, message: "City has no selected placeholder action." };
    }

    const prologueRecord = selectPrologueAction(city, prologueAction.id);
    const fragments = listIdentityFragments(city, [prologueRecord]);
    if (fragments.length === 0) {
      return { ok: false, message: "City has no identity fragments." };
    }

    const timelines = fragments.slice(0, playerCount).map((fragment, index) =>
      createPlayerTimelineFromFragment({
        world,
        city,
        fragment,
        prologueRecords: [prologueRecord],
        playerId: `sim-player-${index + 1}`,
      }),
    );
    const session = createRuntimeSession({
      world,
      city,
      timelineIds: timelines.map((timeline) => timeline.id),
      now: SIMULATION_TIMESTAMP,
    });
    const traces = timelines.map((timeline, index) =>
      performRuntimeAction({
        city,
        timeline,
        actionId: action.id,
        now: SIMULATION_TIMESTAMP,
        sequence: index + 1,
      }),
    );
    const { pulse, observerReport } = settleRuntimeSessionPulse({
      world,
      city,
      session,
      traces,
      now: SIMULATION_TIMESTAMP,
    });

    return {
      ok: true,
      pulse,
      observerReport,
      traceCount: traces.length,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function stateRows(pulse: DailyPulse) {
  const keys = Array.from(
    new Set([
      ...Object.keys(pulse.stateBefore),
      ...Object.keys(pulse.stateAfter),
    ]),
  ).sort();

  return keys.map((key) => {
    const before = pulse.stateBefore[key] ?? 0;
    const after = pulse.stateAfter[key] ?? 0;
    return {
      key,
      before,
      after,
      delta: after - before,
    };
  });
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
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
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
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
const bodyStyle = {
  margin: 0,
  color: "#475569",
  fontSize: 13,
  lineHeight: 1.5,
};
const errorStyle = {
  ...bodyStyle,
  color: "#991b1b",
};
const listStyle = {
  margin: 0,
  paddingLeft: 18,
  color: "#475569",
  fontSize: 13,
  lineHeight: 1.5,
};
const tableStyle = {
  borderCollapse: "collapse" as const,
  width: "100%",
};
const tableHeaderStyle = {
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: 12,
  padding: "6px 4px",
  textAlign: "left" as const,
};
const tableCellStyle = {
  borderBottom: "1px solid #e2e8f0",
  color: "#111318",
  fontSize: 12,
  padding: "6px 4px",
  textAlign: "right" as const,
};
const deltaCellStyle = (delta: number) => ({
  ...tableCellStyle,
  color: delta > 0 ? "#166534" : delta < 0 ? "#991b1b" : "#475569",
});
