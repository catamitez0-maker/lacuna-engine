import type {
  AnchorEvent,
  CityModule,
  ObserverReport,
  PlayerTimeline,
  RuntimeSession,
  Scene,
  StateRule,
  Trace,
  WorldConstant,
  WorldPack,
} from "@lacuna-engine/schema";

export type ExtensionContext = {
  world: WorldPack;
  city?: CityModule;
  timeline?: PlayerTimeline;
  session?: RuntimeSession;
  scene?: Scene;
  traces?: Trace[];
  observerReport?: ObserverReport;
};

export type ExtensionResult<TPayload = unknown> = {
  extensionId: string;
  payload: TPayload;
};

export type AiModelCapability =
  | "text_generation"
  | "structured_output"
  | "tool_calling"
  | "long_context"
  | "local_execution"
  | "low_latency";

export type AiAgentExecutionMode = "hosted" | "local" | "hybrid" | "manual";

export type AiAgentProviderDescriptor = {
  id: string;
  label: string;
  executionMode: AiAgentExecutionMode;
  modelFamily?: string;
  capabilities: AiModelCapability[];
};

export type AiSafetyBoundary = {
  canMutateWorld: false;
  canPersistChanges: false;
  canCallExternalTools: boolean;
  requiresHumanApproval: boolean;
  notes?: string[];
};

export type AiAgentAudit = {
  providerId?: string;
  modelId?: string;
  promptVersion?: string;
  confidence?: number;
  reasoningSummary?: string;
  warnings?: string[];
};

export type AiProposal<TPayload = unknown> = {
  id: string;
  title: string;
  summary: string;
  payload: TPayload;
  audit: AiAgentAudit;
};

export type AiStewardTask =
  | "world_health_check"
  | "rule_consistency_review"
  | "spine_gap_analysis"
  | "simulation_interpretation"
  | "content_patch_suggestion";

export type AiStewardInput = ExtensionContext & {
  task: AiStewardTask;
  focus?: {
    constantIds?: string[];
    stateRuleIds?: string[];
    cityIds?: string[];
    anchorIds?: string[];
    sceneIds?: string[];
  };
  instructions?: string;
};

export type AiStewardSuggestion = {
  kind:
    | "world_constant"
    | "state_rule"
    | "spine"
    | "city_module"
    | "anchor"
    | "scene"
    | "trace_action"
    | "validation_note";
  priority: "low" | "medium" | "high";
  targetId?: string;
  rationale: string;
  proposedPatch?: Record<string, unknown>;
  relatedConstants?: Pick<WorldConstant, "id" | "title">[];
  relatedStateRules?: Pick<StateRule, "id" | "title" | "stateKey">[];
};

export type AiStewardPlan = {
  task: AiStewardTask;
  suggestions: AiStewardSuggestion[];
};

export interface AiStewardAgent {
  id: string;
  provider: AiAgentProviderDescriptor;
  safety: AiSafetyBoundary;
  propose(
    input: AiStewardInput,
  ): Promise<ExtensionResult<AiProposal<AiStewardPlan>>>;
}

export type NpcAgentMemoryRef = {
  id: string;
  type: "profile" | "relationship" | "event_memory" | "world_fact" | "rumor";
  summary: string;
  weight?: number;
};

export type NpcAgentInput = ExtensionContext & {
  npcId: string;
  roleId?: string;
  objective?: string;
  availableActionIds?: string[];
  memoryRefs?: NpcAgentMemoryRef[];
  constraints?: {
    constants?: Pick<WorldConstant, "id" | "title" | "severity">[];
    stateRules?: Pick<StateRule, "id" | "title" | "stateKey">[];
    anchor?: Pick<AnchorEvent, "id" | "title" | "fixed">;
  };
};

export type NpcActionProposal = {
  npcId: string;
  actionId?: string;
  intent: string;
  dialogue?: string;
  traceEffects?: Record<string, number>;
  visibility?: Trace["visibility"];
  rationale: string;
};

export interface NpcAgent {
  id: string;
  provider: AiAgentProviderDescriptor;
  safety: AiSafetyBoundary;
  proposeAction(
    input: NpcAgentInput,
  ): Promise<ExtensionResult<AiProposal<NpcActionProposal>>>;
}

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
  aiStewards: AiStewardAgent[];
  npcAgents: NpcAgent[];
  narrators: NarratorExtension[];
  visualNovelLayers: VisualNovelExtension[];
  mediaRenderers: MediaExtension[];
  miniGames: MiniGameExtension[];
};

export function createEmptyExtensionRegistry(): ExtensionRegistry {
  return {
    aiStewards: [],
    npcAgents: [],
    narrators: [],
    visualNovelLayers: [],
    mediaRenderers: [],
    miniGames: [],
  };
}
