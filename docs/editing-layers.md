# Editing Layers

Lacuna Engine content should be edited in layers. Each layer owns a different
kind of decision, which keeps world rules, event structure, and player-facing
text from collapsing into one large YAML surface.

## World Rules

World rules define what the world allows.

- `constants`: hard or soft world rules such as prohibitions, causal laws, and
  tone constraints.
- `stateRules`: numeric bounds and change rules for tracked state keys.

Events can reference constants with `constantRefs`. State rules can also point
back to constants so a rule has an explicit design reason.

State rules are enforced during Daily Pulse settlement. Use `report` while
designing, `clamp` when the world should absorb excess movement, and `reject`
when a violation should stop settlement.

## World Spine

The spine defines the main structure without writing full scene text.

- `premise`: the world-level premise.
- `currentEra`: the current phase of history or system state.
- `centralConflict`: the main pressure that content should orbit.
- `fixedAnchorIds`: anchor events that form the durable backbone.
- `phases`: ordered groups of anchors used to organize progression.

The spine is a map. It should not carry all details that belong in scenes,
actions, or observer reports.

## Space And Entry

City modules define the local playable surface:

- `stateSchema` and `initialState`
- `entryRoles`
- `identityFragments`
- days, anchors, scenes, and actions

Entry roles and identity fragments define how a player enters the world, what
they know, and how widely their actions can matter.

## Events

Anchors and variants turn the spine into conditional outcomes.

- Anchors should reference relevant constants.
- Variants should declare conditions and effects.
- Variants can declare `traceConditions` when an event requires visible
  evidence, witnesses, rumors, or records.
- Variant effects must use declared state keys.

## Scenes, Actions, And Traces

Scenes and actions are the player-facing layer.

- Scenes describe what the player sees.
- Actions declare what the player can do.
- Traces record what the world remembers or exposes.

## Debugging And Validation

Studio and the content validator should remain the authoring guardrails:

- schema compatibility
- missing references
- orphan events/actions
- state key misuse
- constant reference misuse
- spine references to missing anchors
- state rule audit entries generated during pulse settlement

The current Studio supports structured editing for the first practical slice:
world metadata, constants, state rules, spine, city state, scenes, actions, and
anchor variant effects. Constants, state rules, and spine phases can be created,
updated, deleted, and reordered through the structured editor.

The mutation logic lives in `@lacuna-engine/world-authoring`; Studio only adapts
forms to patches, validates the resulting World Pack, and writes the source file.
