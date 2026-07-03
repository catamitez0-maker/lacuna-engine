# Lacuna Engine

Lacuna Engine is a neutral TypeScript / Next.js monorepo for building
asynchronous narrative world systems.

It is not a concrete novel, setting, city, character roster, chapter system, or
IP-specific story project. The repository provides the engine contracts and
developer surfaces needed to load World Packs, map reader identities, record
historical traces, settle daily world pulses, resolve anchor variants, archive
observer reports, and reserve future AI or media integrations.

## Status

The project currently includes:

- a disabled `empty-world-template` World Pack for framework validation
- a reader-facing `/demo` flow in `apps/web`
- a creator workbench in `apps/studio`
- Prisma + SQLite persistence for runtime sessions and pulse outputs
- structured editing for world constants, state rules, spine, city fields,
  scenes, placeholder actions, and anchor variants
- deterministic mock AI steward and NPC agent proposal flows
- content validation, unit tests, package type builds, and Next production
  builds through one `check` command

No real AI model, image generation, TTS, account system, or visual novel layer is
connected yet.

## Core Loop

The engine is organized around an auditable narrative loop:

```txt
World Constants
  -> State Model
  -> Spine / Anchors
  -> Reader Actions
  -> Historical Traces
  -> Daily Pulse
  -> Anchor Variant Selection
  -> Observer Archive
  -> Validation / Review
```

Reader actions do not directly rewrite the main plot. They create traces.
Traces influence numeric world state. World constants and state rules constrain
how state may change. Anchors keep the major narrative skeleton stable while
allowing variant selection based on state and trace conditions.

## Apps

| App           | Purpose                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| `apps/web`    | Reader-facing framework demo at `/demo`.                                                                       |
| `apps/studio` | Creator workbench for validation, structured edits, raw source edits, simulation, and mock AI proposal review. |

## Packages

| Package             | Responsibility                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `schema`            | Zod schemas, TypeScript types, graph validation, and schema version contracts.                  |
| `content-loader`    | Load and validate single-file or split-directory World Packs.                                   |
| `identity-mapper`   | Convert prologue actions into identity fragments.                                               |
| `trace-ledger`      | Create trace records from runtime actions.                                                      |
| `pulse-engine`      | Apply trace effects, state rules, and daily settlement logic.                                   |
| `anchor-resolver`   | Select anchor variants from state and trace conditions.                                         |
| `observer-archive`  | Generate observer reports and rule audit summaries.                                             |
| `narrative-runtime` | Coordinate scenes, actions, timelines, pulses, sessions, and demo flow.                         |
| `persistence`       | Prisma Client setup, repository functions, runtime snapshots, and SQLite mapping.               |
| `world-authoring`   | Structured World Pack patch logic used by Studio.                                               |
| `extension-api`     | Provider-agnostic extension contracts for AI, NPC agents, media, mini games, and future layers. |
| `kernel`            | Public entrypoint that re-exports core runtime helpers.                                         |
| `ui-kit`            | Shared UI primitives.                                                                           |

For a deeper code map, read
[`docs/developer-guide.md`](./docs/developer-guide.md).

## Requirements

- Node.js 22 or newer
- Corepack-enabled `pnpm`

## Quick Start

```bash
corepack pnpm install
corepack pnpm dev
```

Open:

```txt
http://localhost:3000/demo
```

To run Studio:

```bash
corepack pnpm --filter @lacuna-engine/studio dev --port 3200
```

Open:

```txt
http://localhost:3200
```

## Common Commands

```bash
corepack pnpm dev
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm content:validate
corepack pnpm build
corepack pnpm check
```

`corepack pnpm check` is the normal pre-commit verification command. It runs
linting, type checks, content validation, Vitest, package declaration builds,
and both Next app builds.

Database commands:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:deploy
corepack pnpm db:push
```

End-to-end tests:

```bash
corepack pnpm test:e2e
```

Playwright may require system browser dependencies on a new machine.

## World Packs

A World Pack is the portable content contract for a narrative world. A pack may
be a single `world.yaml` file or a split directory with files under `cities/`,
`roles/`, `days/`, `anchors/`, `scenes/`, `actions/`, and
`prologue-actions/`.

To add a new pack:

1. Create `content/worlds/<world-id>/world.yaml`.
2. Use `schemaVersion: 0.1.0`.
3. Keep concrete story content inside the pack, not in app components.
4. Keep `enabled: false` until an app or creator workflow explicitly selects it.
5. Run `corepack pnpm content:validate`.
6. Run `corepack pnpm test`.

The loader and schema validation check semantic versions, duplicate IDs,
cross-references, state keys used by effects or conditions, prologue action
coverage, orphan anchors, and orphan placeholder actions.

## City Modules

Each city or region module should define:

- `stateSchema`
- `initialState`
- `entryRoles`
- `identityFragments`
- `days`
- `anchors`
- `scenes`
- `prologueActions`
- `placeholderActions`

The apps read this data through `@lacuna-engine/content-loader`. Runtime and UI
code should not hardcode story content.

## Runtime Sessions

`@lacuna-engine/persistence` wraps Prisma 7, SQLite adapter setup, JSON field
mapping, and repository functions for:

- seeding World Packs and City Modules
- saving Player Timelines
- saving Traces, Daily Pulses, and Observer Reports
- creating Runtime Sessions
- settling one Daily Pulse from traces across multiple timelines

The `/demo` page includes both the in-memory framework flow and a Prisma-backed
persisted snapshot action.

Runtime sessions can be inspected and controlled through:

```txt
GET   /api/sessions/:sessionId
PATCH /api/sessions/:sessionId
```

`PATCH` accepts `status` values of `open`, `paused`, or `archived`.

## Studio

`apps/studio` is the creator workbench. It currently provides:

- World Pack validation status
- enabled state and city metrics
- structured editing for constants, state rules, spine, city fields, scenes,
  actions, and anchor variants
- raw `world.yaml` editing with save-before-write validation
- simulation output with state deltas, selected variants, traces, rule audit,
  and observer lines
- AI Workbench proposal previews powered by deterministic mock agents

The AI Workbench does not apply proposals to content. It only previews steward
review suggestions, NPC action proposals, and proposal review status.

## AI And Extensions

`@lacuna-engine/extension-api` reserves typed hooks for:

- AI narrator adapters
- AI steward or hosted world-management agents
- NPC AI agents
- visual novel layers
- image or media renderers
- text-to-speech adapters
- maps
- mini game layers
- multiplayer accounts
- creator studio tools

The extension layer is provider-agnostic. A future adapter can target a
self-hosted model, a general model API, a specialized model, or a hybrid router.
Current mock agents are deterministic and return inert proposals only.

## Documentation

Start here:

- [Developer Guide](./docs/developer-guide.md)
- [Architecture](./docs/architecture.md)
- [Editing Layers](./docs/editing-layers.md)
- [World Pack Spec](./docs/world-pack-spec.md)
- [City Module Spec](./docs/city-module-spec.md)
- [Extension API](./docs/extension-api.md)
- [Persistence](./docs/persistence.md)
- [Runtime Session](./docs/runtime-session.md)

The docs intentionally describe engine structure rather than fictional content.

## Current Boundaries

The repository deliberately avoids:

- concrete story canon
- named cities or characters beyond neutral placeholders
- real AI provider integrations
- generated images, TTS, or visual novel presentation
- account, permission, or multiplayer production workflows

Those systems should be added through World Packs or extension adapters rather
than directly inside core runtime packages.
