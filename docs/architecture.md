# Architecture

Lacuna Engine separates content, runtime logic, persistence, and presentation.

- Content lives in versioned World Packs under `content/worlds`, with world
  constants, state rules, spine, city modules, events, scenes, and actions kept
  in content files.
- Schemas and compatibility rules live in `packages/schema`.
- Structured authoring mutations live in `packages/world-authoring`.
- Runtime modules live in focused packages such as `identity-mapper`,
  `trace-ledger`, `pulse-engine`, and `observer-archive`.
- `packages/narrative-runtime` coordinates the first complete text/data flow.
- `packages/persistence` owns Prisma client setup, JSON mapping, migrations,
  sessions, and persistence repositories.
- `apps/web` loads content and renders state; it does not own engine rules.
- `apps/web` also exposes the first persisted session API.
- `apps/studio` provides the first World Pack validation, review, structured
  editing, and raw editing surface.

The first version is intentionally deterministic. Player actions create traces,
traces affect Daily Pulse state, anchors select variants, and observer reports
record the result.

## Package Direction

The intended dependency direction is:

```text
schema
  -> content-loader
  -> world-authoring
  -> identity-mapper / trace-ledger / anchor-resolver / pulse-engine / observer-archive
  -> narrative-runtime
  -> persistence
  -> apps
```

`content-loader` has a pure root entry and a Node-only `server` entry.
`world-authoring` mutates already-loaded editable records but never performs
file-system writes. Studio server actions bridge those packages to `world.yaml`.

`packages/schema` is split into schema definitions, inferred types, and
validation helpers. `packages/persistence` is split by role:

- `client.ts`: Prisma client construction and development caching.
- `types.ts`: persisted snapshot types.
- `json.ts`: JSON serialization helpers.
- `mappers.ts`: Prisma rows back into schema-validated domain objects.
- `repositories.ts`: save/load/session repository operations.
- `demo.ts`: persisted framework demo orchestration.
