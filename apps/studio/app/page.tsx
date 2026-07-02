import { join } from "node:path";
import {
  listWorldPackIds,
  readWorldPackSourceById,
  resolveWorldPackFilePath,
  resolveWorldPackPath,
  validateWorldPackSourceFromPath,
} from "@lacuna-engine/content-loader/server";
import { WorldSourceEditor } from "./components/world-source-editor";
import { WorldStructuredEditor } from "./components/world-structured-editor";
import { WorldAiWorkbench } from "./components/world-ai-workbench";

const CONTENT_DIR = join(
  /* turbopackIgnore: true */ process.cwd(),
  "../../content/worlds",
);

export default function StudioPage() {
  const worldIds = listWorldPackIds({ contentDir: CONTENT_DIR });
  const results = worldIds.map((worldId) => {
    const source = readWorldPackSourceById(worldId, {
      contentDir: CONTENT_DIR,
    });
    return {
      result: validateWorldPackSourceFromPath(
        resolveWorldPackPath(worldId, { contentDir: CONTENT_DIR }),
        source,
        resolveWorldPackFilePath(worldId, { contentDir: CONTENT_DIR }),
      ),
      source,
    };
  });

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Lacuna Studio</p>
          <h1 style={titleStyle}>World Pack Review</h1>
        </div>
        <span style={pillStyle}>{results.length} packs</span>
      </header>

      <section style={gridStyle}>
        {results.map(({ result, source }) => (
          <article key={result.worldId} style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <p style={eyebrowStyle}>{result.ok ? "Ready" : "Blocked"}</p>
                <h2 style={panelTitleStyle}>{result.worldId}</h2>
              </div>
              <span style={result.ok ? okPillStyle : failPillStyle}>
                {result.ok ? "valid" : "invalid"}
              </span>
            </div>

            <div style={detailGridStyle}>
              <div style={leftColumnStyle}>
                {result.ok && result.world ? (
                  <>
                    <WorldPreview world={result.world} />
                    <WorldAiWorkbench world={result.world} />
                    <WorldStructuredEditor world={result.world} />
                  </>
                ) : (
                  <ul style={listStyle}>
                    {result.issues.map((issue) => (
                      <li key={`${issue.path}-${issue.message}`}>
                        {issue.path ? `${issue.path}: ` : ""}
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <WorldSourceEditor
                worldId={result.worldId}
                initialSource={source}
                initialIssues={result.issues}
              />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function WorldPreview({
  world,
}: {
  world: NonNullable<
    ReturnType<typeof validateWorldPackSourceFromPath>["world"]
  >;
}) {
  return (
    <div style={previewStyle}>
      <dl style={metaGridStyle}>
        <div>
          <dt style={termStyle}>Name</dt>
          <dd style={descStyle}>{world.name}</dd>
        </div>
        <div>
          <dt style={termStyle}>Version</dt>
          <dd style={descStyle}>{world.version}</dd>
        </div>
        <div>
          <dt style={termStyle}>Status</dt>
          <dd style={descStyle}>{world.enabled ? "enabled" : "disabled"}</dd>
        </div>
        <Metric label="Constants" value={String(world.constants.length)} />
        <Metric label="State Rules" value={String(world.stateRules.length)} />
        <Metric
          label="Spine Phases"
          value={String(world.spine?.phases.length ?? 0)}
        />
      </dl>

      {world.cities.map((city) => (
        <section key={city.id} style={cityStyle}>
          <h3 style={cityTitleStyle}>{city.name}</h3>
          <p style={bodyStyle}>{city.description}</p>
          <dl style={metaGridStyle}>
            <Metric
              label="State Keys"
              value={Object.keys(city.initialState).join(", ")}
            />
            <Metric
              label="Entry Roles"
              value={String(city.entryRoles.length)}
            />
            <Metric label="Days" value={String(city.days.length)} />
            <Metric label="Anchors" value={String(city.anchors.length)} />
            <Metric label="Scenes" value={String(city.scenes.length)} />
            <Metric
              label="Actions"
              value={String(city.placeholderActions.length)}
            />
          </dl>
        </section>
      ))}
    </div>
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

const pageStyle = {
  minHeight: "100vh",
  margin: 0,
  padding: 32,
  background: "#f7f5ef",
  color: "#111318",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};
const headerStyle = {
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  gap: 16,
  borderBottom: "1px solid #d9d4ca",
  paddingBottom: 20,
  marginBottom: 24,
};
const eyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase" as const,
};
const titleStyle = { margin: "6px 0 0", fontSize: 34, lineHeight: 1.1 };
const gridStyle = { display: "grid", gap: 16 };
const panelStyle = {
  border: "1px solid #d9d4ca",
  borderRadius: 8,
  background: "#fff",
  padding: 20,
};
const panelHeaderStyle = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 16,
};
const panelTitleStyle = { margin: "6px 0 0", fontSize: 22 };
const detailGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
  gap: 18,
  alignItems: "start",
};
const leftColumnStyle = { display: "grid", gap: 16 };
const pillStyle = {
  border: "1px solid #d9d4ca",
  borderRadius: 4,
  padding: "6px 10px",
  background: "#fff",
  fontSize: 13,
  fontWeight: 700,
};
const okPillStyle = { ...pillStyle, color: "#166534", background: "#f0fdf4" };
const failPillStyle = { ...pillStyle, color: "#991b1b", background: "#fef2f2" };
const previewStyle = { display: "grid", gap: 14 };
const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  margin: 0,
};
const cityStyle = {
  borderTop: "1px solid #d9d4ca",
  paddingTop: 14,
  display: "grid",
  gap: 10,
};
const cityTitleStyle = { margin: 0, fontSize: 18 };
const termStyle = { color: "#64748b", fontSize: 12, fontWeight: 700 };
const descStyle = { margin: "4px 0 0", color: "#111318", fontSize: 14 };
const bodyStyle = {
  margin: 0,
  color: "#475569",
  fontSize: 14,
  lineHeight: 1.6,
};
const listStyle = { margin: 0, paddingLeft: 18, color: "#991b1b" };
