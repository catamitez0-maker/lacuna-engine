import type {
  CityModule,
  ObserverReport,
  PlayerTimeline,
  Scene,
  Trace,
  WorldPack,
} from "@lacuna-engine/schema";

export type ExtensionContext = {
  world: WorldPack;
  city?: CityModule;
  timeline?: PlayerTimeline;
  scene?: Scene;
  traces?: Trace[];
  observerReport?: ObserverReport;
};

export type ExtensionResult<TPayload = unknown> = {
  extensionId: string;
  payload: TPayload;
};

export interface NarratorExtension {
  id: string;
  describeScene(context: ExtensionContext): Promise<ExtensionResult<string>>;
}

export interface VisualNovelExtension {
  id: string;
  presentScene(context: ExtensionContext): Promise<ExtensionResult>;
}

export interface MediaExtension {
  id: string;
  renderAsset(context: ExtensionContext): Promise<ExtensionResult>;
}

export interface MiniGameExtension {
  id: string;
  runChallenge(context: ExtensionContext): Promise<ExtensionResult>;
}

export type ExtensionRegistry = {
  narrators: NarratorExtension[];
  visualNovelLayers: VisualNovelExtension[];
  mediaRenderers: MediaExtension[];
  miniGames: MiniGameExtension[];
};

export function createEmptyExtensionRegistry(): ExtensionRegistry {
  return {
    narrators: [],
    visualNovelLayers: [],
    mediaRenderers: [],
    miniGames: [],
  };
}
