"use client";

import { create } from "zustand";
import {
  createPlayerTimelineFromFragment,
  getEntryScene,
  getPrimaryCity,
  listIdentityFragments,
  performRuntimeAction,
  selectPrologueAction,
  settleRuntimePulse,
} from "@lacuna-engine/narrative-runtime";
import type {
  CityModule,
  DailyPulse,
  IdentityFragment,
  ObserverReport,
  PlayerTimeline,
  PrologueAction,
  Scene,
  Trace,
  WorldPack,
} from "@lacuna-engine/schema";

export type DemoStep =
  | "empty"
  | "loaded"
  | "prologue"
  | "fragments"
  | "scene"
  | "trace"
  | "report";

export type PrologueRecord = {
  actionId: string;
  tendency: PrologueAction["tendency"];
};

export type DemoStore = {
  step: DemoStep;
  activeWorld?: WorldPack;
  city?: CityModule;
  records: PrologueRecord[];
  fragments: IdentityFragment[];
  timeline?: PlayerTimeline;
  scene?: Scene;
  traces: Trace[];
  pulse?: DailyPulse;
  observerReport?: ObserverReport;
  loadWorld: (world: WorldPack) => void;
  start: () => void;
  choosePrologueAction: (actionId: string) => void;
  chooseFragment: (fragmentId: string) => void;
  performAction: (actionId: string) => void;
  runPulse: () => void;
  reset: () => void;
};

const initialDemoState = {
  step: "empty" as DemoStep,
  activeWorld: undefined,
  city: undefined,
  records: [],
  fragments: [],
  timeline: undefined,
  scene: undefined,
  traces: [],
  pulse: undefined,
  observerReport: undefined,
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  ...initialDemoState,
  loadWorld: (world) => {
    set({
      ...initialDemoState,
      step: "loaded",
      activeWorld: world,
      city: getPrimaryCity(world),
    });
  },
  start: () => set({ step: "prologue" }),
  choosePrologueAction: (actionId) => {
    const { city } = get();
    if (!city) {
      return;
    }

    const record = selectPrologueAction(city, actionId);
    const records = [record];

    set({
      step: "fragments",
      records,
      fragments: listIdentityFragments(city, records),
    });
  },
  chooseFragment: (fragmentId) => {
    const { activeWorld, city, fragments, records } = get();
    if (!activeWorld || !city) {
      return;
    }

    const fragment = fragments.find((candidate) => candidate.id === fragmentId);
    if (!fragment) {
      return;
    }

    const timeline = createPlayerTimelineFromFragment({
      world: activeWorld,
      city,
      fragment,
      prologueRecords: records,
    });

    set({
      step: "scene",
      timeline,
      scene: getEntryScene(city, timeline),
    });
  },
  performAction: (actionId) => {
    const { city, timeline, traces } = get();
    if (!city || !timeline) {
      return;
    }

    const trace = performRuntimeAction({
      city,
      timeline,
      actionId,
      sequence: traces.length + 1,
    });

    set({
      step: "trace",
      traces: [...traces, trace],
    });
  },
  runPulse: () => {
    const { activeWorld, city, timeline, traces } = get();
    if (!activeWorld || !city || !timeline) {
      return;
    }

    const { pulse, observerReport } = settleRuntimePulse({
      world: activeWorld,
      city,
      timeline,
      traces,
    });

    set({
      step: "report",
      pulse,
      observerReport,
    });
  },
  reset: () => set(initialDemoState),
}));
