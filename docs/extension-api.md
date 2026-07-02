# Extension API

`@lacuna-engine/extension-api` reserves contracts for future layers:

- AI narrator
- AI steward or hosted world-management agent
- NPC AI agent
- visual novel presenter
- media renderer
- TTS
- map layer
- mini game layer
- account or multiplayer service
- creator tooling

The first version does not connect any of these systems. Adapters should consume
engine context, traces, scenes, and observer reports without mutating core
content directly.

## AI Steward Interface

`AiStewardAgent` is the reserved contract for AI-assisted creator tooling. It can
review world constants, state rules, spine structure, simulation output, and
content graph health. It returns suggestions and proposed patches as inert data;
the Studio or a human reviewer decides whether to apply them.

Supported task categories are:

- `world_health_check`
- `rule_consistency_review`
- `spine_gap_analysis`
- `simulation_interpretation`
- `content_patch_suggestion`

## NPC Agent Interface

`NpcAgent` is the reserved contract for NPC behavior proposals. It receives
world context, timeline/session context, available action IDs, memory references,
and optional rule constraints. It can propose an intent, dialogue, selected
action, and trace effects, but it does not execute the action directly.

## Provider Boundary

The interfaces intentionally avoid naming a model provider. A future adapter may
target a self-hosted model, a general model API, a specialized model, or a hybrid
router. Provider metadata is represented by `AiAgentProviderDescriptor`, and
safety expectations are represented by `AiSafetyBoundary`.

## Mock Workflow

The first usable workflow is deterministic:

- `createMockAiStewardAgent` generates creator-facing review suggestions.
- `createMockNpcAgent` generates NPC action proposals from available placeholder
  actions.
- `createManualAiProposalReview` marks steward proposals as preview-ready but
  not applicable.

Studio can render these proposals today. Applying proposals to `world.yaml`
remains deliberately disconnected until a human approval and validation pipeline
is added.
