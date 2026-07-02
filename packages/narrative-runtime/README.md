# @lacuna-engine/narrative-runtime

Coordinates scenes, actions, identity selection, trace creation, pulse execution,
and observer reports.

It also owns Runtime Session state transitions for open, paused, settled, and
archived sessions.

Apps should call this package instead of duplicating engine flow logic. Keep UI
state in apps and story content in World Packs.

## Module map

- `index.ts` is the public facade and re-exports package APIs.
- `timeline.ts` handles prologue records, fragment listing, and timeline creation.
- `actions.ts` turns placeholder actions into traces.
- `pulse.ts` settles a single timeline/day pulse and observer report.
- `session.ts` owns runtime session lifecycle and session-level pulse settlement.
- `demo.ts` runs the neutral framework demo flow end to end.
- `entities.ts` contains shared entity lookup helpers.
- `ids.ts` contains deterministic runtime ID builders.
- `types.ts` contains public input/result types.
