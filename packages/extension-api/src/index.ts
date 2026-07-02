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

export type AiProposalReviewStatus =
  | "preview"
  | "ready_for_human_review"
  | "blocked";

export type AiProposalReview = {
  proposalId: string;
  status: AiProposalReviewStatus;
  canApply: false;
  requiresHumanApproval: true;
  messages: string[];
  proposedPatchCount: number;
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

export const mockAiProvider: AiAgentProviderDescriptor = {
  id: "mock-ai-provider",
  label: "Mock AI Provider",
  executionMode: "manual",
  modelFamily: "deterministic-placeholder",
  capabilities: ["structured_output"],
};

export const humanApprovedProposalSafety: AiSafetyBoundary = {
  canMutateWorld: false,
  canPersistChanges: false,
  canCallExternalTools: false,
  requiresHumanApproval: true,
  notes: ["Mock agents return inert proposals only."],
};

export function createManualAiProposalReview(
  proposal: AiProposal<AiStewardPlan>,
): AiProposalReview {
  const proposedPatchCount = proposal.payload.suggestions.filter(
    (suggestion) => suggestion.proposedPatch,
  ).length;

  return {
    proposalId: proposal.id,
    status: "ready_for_human_review",
    canApply: false,
    requiresHumanApproval: true,
    proposedPatchCount,
    messages: [
      "Proposal preview is available.",
      "No apply adapter is connected; writing to content is disabled.",
      "Human approval is required before any future write path can run.",
    ],
  };
}

export function createMockAiStewardAgent(
  id = "mock-ai-steward",
): AiStewardAgent {
  return {
    id,
    provider: mockAiProvider,
    safety: humanApprovedProposalSafety,
    async propose(input) {
      const suggestions = buildMockStewardSuggestions(input);

      return {
        extensionId: id,
        payload: {
          id: `${input.world.id}-${input.task}-proposal`,
          title: `Mock ${input.task.replaceAll("_", " ")} proposal`,
          summary:
            suggestions.length > 0
              ? `${suggestions.length} review suggestions generated.`
              : "No review suggestions generated.",
          payload: {
            task: input.task,
            suggestions,
          },
          audit: {
            providerId: mockAiProvider.id,
            modelId: "mock-deterministic-agent",
            promptVersion: "mock-v1",
            confidence: 0,
            reasoningSummary:
              "Deterministic placeholder based on World Pack structure only.",
            warnings: ["No AI model is connected."],
          },
        },
      };
    },
  };
}

export function createMockNpcAgent(id = "mock-npc-agent"): NpcAgent {
  return {
    id,
    provider: mockAiProvider,
    safety: humanApprovedProposalSafety,
    async proposeAction(input) {
      const city = input.city ?? input.world.cities[0];
      const availableActionIds =
        input.availableActionIds ??
        city?.placeholderActions.map((action) => action.id) ??
        [];
      const action = city?.placeholderActions.find(
        (candidate) => candidate.id === availableActionIds[0],
      );
      const intent = input.objective?.trim() || "observe";

      return {
        extensionId: id,
        payload: {
          id: `${input.npcId}-mock-action-proposal`,
          title: "Mock NPC action proposal",
          summary: "A deterministic NPC proposal was generated.",
          payload: {
            npcId: input.npcId,
            actionId: action?.id,
            intent,
            dialogue: "A placeholder NPC line would appear here.",
            traceEffects: action?.trace.effects ?? {},
            visibility: action?.trace.visibility,
            rationale:
              "Mock NPC agent selects the first available action and echoes the requested objective.",
          },
          audit: {
            providerId: mockAiProvider.id,
            modelId: "mock-deterministic-agent",
            promptVersion: "mock-v1",
            confidence: 0,
            warnings: ["No AI model is connected."],
          },
        },
      };
    },
  };
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

function buildMockStewardSuggestions(
  input: AiStewardInput,
): AiStewardSuggestion[] {
  const suggestions: AiStewardSuggestion[] = [];

  if (input.world.constants.length === 0) {
    suggestions.push({
      kind: "world_constant",
      priority: "high",
      rationale: "World Pack has no world constants reserved.",
      proposedPatch: {
        constants: [
          {
            id: "placeholder-world-constant",
            title: "Placeholder World Constant",
            severity: "soft",
          },
        ],
      },
    });
  }

  for (const rule of input.world.stateRules) {
    if (rule.constantRefs.length === 0) {
      suggestions.push({
        kind: "state_rule",
        priority: "medium",
        targetId: rule.id,
        rationale: `State rule ${rule.id} does not reference a world constant.`,
        relatedStateRules: [rule],
      });
    }
  }

  if (!input.world.spine) {
    suggestions.push({
      kind: "spine",
      priority: "high",
      rationale: "World Pack has no spine definition.",
    });
  } else if (input.world.spine.phases.length === 0) {
    suggestions.push({
      kind: "spine",
      priority: "medium",
      rationale: "World spine has no phases.",
    });
  }

  for (const city of input.world.cities) {
    if (city.anchors.length === 0) {
      suggestions.push({
        kind: "anchor",
        priority: "medium",
        targetId: city.id,
        rationale: `City module ${city.id} has no anchors.`,
      });
    }

    if (city.placeholderActions.length === 0) {
      suggestions.push({
        kind: "trace_action",
        priority: "high",
        targetId: city.id,
        rationale: `City module ${city.id} has no placeholder trace actions.`,
      });
    }
  }

  if (input.observerReport) {
    suggestions.push({
      kind: "validation_note",
      priority: "low",
      targetId: input.observerReport.id,
      rationale: "Observer report is available for future simulation review.",
    });
  }

  if (input.task === "simulation_interpretation" && !input.observerReport) {
    suggestions.push({
      kind: "validation_note",
      priority: "medium",
      rationale:
        "Simulation interpretation was requested without an observer report.",
    });
  }

  return suggestions;
}
