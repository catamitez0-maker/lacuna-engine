"use client";

import { useActionState } from "react";
import type { WorldPack } from "@lacuna-engine/schema";
import {
  saveWorldPackStructuredAction,
  type SaveWorldPackStructuredState,
} from "../actions";
import { CityEditor } from "./structured-editor/city-editor";
import {
  errorPillStyle,
  eyebrowStyle,
  issueListStyle,
  sectionHeaderStyle,
  sectionTitleStyle,
  successPillStyle,
  surfaceStyle,
} from "./structured-editor/styles";
import { WorldMetadataForm } from "./structured-editor/world-metadata-form";
import { WorldRuleEditor } from "./structured-editor/world-rule-editor";
import {
  WorldSpineCreateForm,
  WorldSpineEditor,
} from "./structured-editor/world-spine-editor";
import { WorldSimulationPanel } from "./world-simulation-panel";

const initialState: SaveWorldPackStructuredState = {
  ok: true,
  message: "",
  issues: [],
};

export function WorldStructuredEditor({ world }: { world: WorldPack }) {
  const [state, formAction, isPending] = useActionState(
    saveWorldPackStructuredAction,
    initialState,
  );

  return (
    <section style={surfaceStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>Structured Edit</p>
          <h3 style={sectionTitleStyle}>World Pack Fields</h3>
        </div>
        {state.message ? (
          <span style={state.ok ? successPillStyle : errorPillStyle}>
            {state.message}
          </span>
        ) : null}
      </div>

      <WorldMetadataForm
        world={world}
        action={formAction}
        isPending={isPending}
      />

      <WorldRuleEditor
        worldId={world.id}
        constants={world.constants}
        stateRules={world.stateRules}
        action={formAction}
        isPending={isPending}
      />

      {world.spine ? (
        <WorldSpineEditor
          worldId={world.id}
          spine={world.spine}
          action={formAction}
          isPending={isPending}
        />
      ) : (
        <WorldSpineCreateForm
          worldId={world.id}
          action={formAction}
          isPending={isPending}
        />
      )}

      <WorldSimulationPanel world={world} />

      {world.cities.map((city) => (
        <CityEditor
          key={city.id}
          worldId={world.id}
          city={city}
          action={formAction}
          isPending={isPending}
        />
      ))}

      {state.issues.length > 0 ? (
        <ul style={issueListStyle}>
          {state.issues.map((issue) => (
            <li key={`${issue.path ?? "root"}-${issue.message}`}>
              {issue.path ? `${issue.path}: ` : ""}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
