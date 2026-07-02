"use client";

import type {
  CityModule,
  DailyPulse,
  IdentityFragment,
  ObserverReport,
  PlayerTimeline,
  Scene,
  Trace,
  WorldPack,
} from "@lacuna-engine/schema";
import { DataBlock, EnginePanel } from "@lacuna-engine/ui-kit";
import type { PrologueRecord } from "./demo-store";

export function WorldLoaderPanel({
  loaded,
  activeWorld,
  templateWorld,
  onLoadWorld,
  onStart,
}: {
  loaded: boolean;
  activeWorld?: WorldPack;
  templateWorld: WorldPack;
  onLoadWorld: (world: WorldPack) => void;
  onStart: () => void;
}) {
  return (
    <EnginePanel title="World Loader" eyebrow="Template">
      <div className="grid gap-3 text-sm leading-6 text-slate-600">
        <p>{loaded ? activeWorld?.description : "No active world loaded"}</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded bg-ink px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={() => onLoadWorld(templateWorld)}
            type="button"
          >
            Load empty world template
          </button>
          <button
            className="rounded border border-rule bg-white px-3 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:text-slate-300"
            disabled={!loaded}
            onClick={onStart}
            type="button"
          >
            Start framework demo
          </button>
        </div>
      </div>
    </EnginePanel>
  );
}

export function ProloguePanel({
  city,
  onChoose,
}: {
  city: CityModule;
  onChoose: (actionId: string) => void;
}) {
  return (
    <EnginePanel title="Entry Sequence" eyebrow="Identity Mapping">
      <p className="mb-4 text-sm leading-7 text-slate-600">
        An entry sequence would appear here.
      </p>
      <div className="flex flex-wrap gap-2">
        {city.prologueActions.map((action) => (
          <button
            className="rounded border border-rule bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-signal"
            key={action.id}
            onClick={() => onChoose(action.id)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </EnginePanel>
  );
}

export function FragmentPanel({
  fragments,
  onChoose,
}: {
  fragments: IdentityFragment[];
  onChoose: (fragmentId: string) => void;
}) {
  return (
    <EnginePanel title="Identity Fragments" eyebrow="Choose One">
      <div className="grid gap-3 md:grid-cols-3">
        {fragments.map((fragment) => (
          <button
            className="rounded border border-rule bg-white p-4 text-left hover:border-signal"
            key={fragment.id}
            onClick={() => onChoose(fragment.id)}
            type="button"
          >
            <span className="block text-sm font-semibold text-ink">
              {fragment.label}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {fragment.description}
            </span>
          </button>
        ))}
      </div>
    </EnginePanel>
  );
}

export function RuntimeScenePanel({
  city,
  scene,
  onPerformAction,
}: {
  city: CityModule;
  scene: Scene;
  onPerformAction: (actionId: string) => void;
}) {
  return (
    <EnginePanel title={scene.title} eyebrow="Runtime Scene">
      <p className="mb-4 text-sm leading-7 text-slate-600">{scene.body}</p>
      <div className="flex flex-wrap gap-2">
        {city.placeholderActions.map((action) => (
          <button
            className="rounded bg-ink px-3 py-2 text-sm font-semibold text-white"
            key={action.id}
            onClick={() => onPerformAction(action.id)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </EnginePanel>
  );
}

export function DailyPulsePanel({ onRunPulse }: { onRunPulse: () => void }) {
  return (
    <EnginePanel title="Daily Pulse" eyebrow="Settlement">
      <p className="mb-4 text-sm leading-7 text-slate-600">
        A trace has been recorded for the current placeholder action.
      </p>
      <button
        className="rounded bg-ink px-3 py-2 text-sm font-semibold text-white"
        onClick={onRunPulse}
        type="button"
      >
        Run DailyPulse
      </button>
    </EnginePanel>
  );
}

export function RuntimeDataGrid({
  records,
  timeline,
  traces,
  pulse,
  observerReport,
}: {
  records: PrologueRecord[];
  timeline?: PlayerTimeline;
  traces: Trace[];
  pulse?: DailyPulse;
  observerReport?: ObserverReport;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {timeline ? <DataBlock title="PlayerTimeline" value={timeline} /> : null}
      {records.length ? (
        <DataBlock title="Prologue Record" value={records} />
      ) : null}
      {traces.length ? <DataBlock title="Trace list" value={traces} /> : null}
      {pulse ? <DataBlock title="DailyPulse result" value={pulse} /> : null}
      {pulse ? (
        <DataBlock
          title="City state before / after"
          value={{
            before: pulse.stateBefore,
            after: pulse.stateAfter,
          }}
        />
      ) : null}
      {observerReport ? (
        <DataBlock title="ObserverReport" value={observerReport} />
      ) : null}
    </section>
  );
}
