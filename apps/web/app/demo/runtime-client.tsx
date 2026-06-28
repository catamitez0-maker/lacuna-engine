"use client";

import { useEffect, useState, useTransition } from "react";
import type { WorldPack } from "@lacuna-engine/schema";
import { DataBlock, EnginePanel, StatusPill } from "@lacuna-engine/ui-kit";
import {
  DailyPulsePanel,
  FragmentPanel,
  ProloguePanel,
  RuntimeDataGrid,
  RuntimeScenePanel,
  WorldLoaderPanel
} from "./demo-panels";
import { runPersistedFrameworkDemoAction, type PersistedDemoActionResult } from "./actions";
import { useDemoStore } from "./demo-store";

export function DemoRuntimeClient({
  templateWorld
}: {
  templateWorld: WorldPack;
}) {
  const {
    step,
    activeWorld,
    city,
    records,
    fragments,
    timeline,
    scene,
    traces,
    pulse,
    observerReport,
    loadWorld,
    start,
    choosePrologueAction,
    chooseFragment,
    performAction,
    runPulse,
    reset
  } = useDemoStore();
  const [persistedResult, setPersistedResult] =
    useState<PersistedDemoActionResult | null>(null);
  const [isPersisting, startPersisting] = useTransition();

  useEffect(() => {
    reset();
  }, [reset]);

  const loaded = Boolean(activeWorld && city);

  function runPersistedDemo() {
    startPersisting(async () => {
      setPersistedResult(await runPersistedFrameworkDemoAction());
    });
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-col gap-4 border-b border-rule pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-signal">
              Lacuna Engine
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Framework Demo
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{loaded ? activeWorld?.id : "No active world loaded"}</StatusPill>
            <StatusPill>{step}</StatusPill>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <WorldLoaderPanel
            activeWorld={activeWorld}
            loaded={loaded}
            onLoadWorld={loadWorld}
            onStart={start}
            templateWorld={templateWorld}
          />

          <div className="grid gap-5">
            {city ? (
              <EnginePanel title={city.name} eyebrow="City Module">
                <p className="text-sm leading-7 text-slate-600">{city.description}</p>
              </EnginePanel>
            ) : null}

            {step === "prologue" && city ? (
              <ProloguePanel city={city} onChoose={choosePrologueAction} />
            ) : null}

            {step === "fragments" ? (
              <FragmentPanel fragments={fragments} onChoose={chooseFragment} />
            ) : null}

            {step === "scene" && city && scene ? (
              <RuntimeScenePanel
                city={city}
                onPerformAction={performAction}
                scene={scene}
              />
            ) : null}

            {step === "trace" ? <DailyPulsePanel onRunPulse={runPulse} /> : null}


            <EnginePanel title="Persisted Runtime" eyebrow="Prisma">
              <div className="grid gap-3 text-sm leading-6 text-slate-600">
                <p>
                  Run the same framework flow through the Prisma-backed repository.
                </p>
                <button
                  className="w-fit rounded bg-ink px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isPersisting}
                  onClick={runPersistedDemo}
                  type="button"
                >
                  {isPersisting ? "Persisting..." : "Run persisted demo"}
                </button>
                {persistedResult?.ok === false ? (
                  <p className="text-sm text-red-700">{persistedResult.error}</p>
                ) : null}
                {persistedResult?.ok ? (
                  <DataBlock
                    title="Persisted snapshot"
                    value={persistedResult.snapshot}
                  />
                ) : null}
              </div>
            </EnginePanel>

            <RuntimeDataGrid
              observerReport={observerReport}
              pulse={pulse}
              records={records}
              timeline={timeline}
              traces={traces}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
