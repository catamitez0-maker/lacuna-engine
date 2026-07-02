# World Pack Spec

A World Pack is a versioned content bundle:

- `id`
- `name`
- `schemaVersion`
- `version`
- `description`
- `enabled`
- `constants`
- `stateRules`
- `spine`
- `cities`

World Packs can contain city modules, entry roles, days, anchors, scenes,
placeholder actions, and archive data. A pack may be disabled and still loaded
by tests or explicit demo flows.

## Versioning

`schemaVersion` declares the engine contract required by the pack. The current
supported value is `0.1.0`. Unsupported schema versions fail validation before
runtime.

`version` is the content version for the pack itself and must use semantic
version format such as `0.1.0`.

## Validation Rules

The schema validates more than field shape. It also checks:

- duplicate IDs inside each city module
- role/day/scene/action/anchor references
- scene and anchor `cityId` consistency
- role entry scenes matching role entry days
- state keys used by initial state, trace effects, anchor conditions, and anchor
  effects
- state rules reference declared state keys
- constant references point to declared world constants
- spine fixed anchors and phase anchors point to declared anchors
- one each of `observe`, `help`, and `hide` prologue actions
- anchors and placeholder actions are referenced by days/scenes

## World-Level Structure

`constants` define world rules. They can be `invariant`, `prohibition`,
`causal`, or `tone`, and each is either `hard` or `soft`.

`stateRules` define numeric bounds and daily movement limits for state keys.
They can reference constants to explain the rule source. A rule can set
`enforcement`:

- `report`: record violations without changing the pulse result.
- `clamp`: clamp the affected state key into the allowed movement/range.
- `reject`: stop settlement when the rule is violated.

`spine` defines the world premise, current era, central conflict, fixed anchors,
and ordered phases. It is the high-level structure that anchors and scenes later
fill in.

Anchors and anchor variants can declare `constantRefs` so event development is
traceable back to world rules.

Anchor variants can also declare `traceConditions`. These require traces with
specific type and/or visibility before a variant can be selected.

Do not place concrete content in engine packages. Content belongs in pack files
so apps can switch packs without changing runtime code.
