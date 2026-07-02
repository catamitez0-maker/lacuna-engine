# @lacuna-engine/extension-api

Typed extension hooks reserved for AI narrators, hosted AI stewards, NPC AI
agents, visual novel layers, image renderers, TTS, maps, minigames, multiplayer
accounts, and creator tooling.

The package exports contracts only. Extension adapters should stay outside the
core runtime until they have stable requirements.

## AI Extension Layers

- `AiStewardAgent` is reserved for hosted or local AI systems that help manage a
  World Pack: health checks, rule consistency review, spine gap analysis,
  simulation interpretation, and content patch suggestions.
- `NpcAgent` is reserved for NPC-level decision systems that propose intents,
  dialogue, action IDs, and trace effects.
- Both AI layers return proposals with audit metadata. They must not mutate
  World Packs, persist changes, or bypass human approval through this interface.

Provider-specific adapters can map these interfaces to a self-hosted model, a
general model API, a specialized model, or a hybrid router later.
