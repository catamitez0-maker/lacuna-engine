# Lacuna Engine

Lacuna Engine is a neutral TypeScript / Next.js monorepo skeleton for
asynchronous narrative world systems.

It is not a concrete novel project. It does not ship named cities, named
characters, chapters, fictional canon, or IP-specific lore. The repository
contains schemas, runtime packages, a disabled empty World Pack template, and a
minimal reader demo that proves the data flow.

## What Is Included

```txt
apps/
  web/       Reader-facing framework demo at /demo
  studio/    Creator review, structured edit, and raw World Pack editing surface
packages/
  kernel/
  schema/
  content-loader/
  identity-mapper/
  trace-ledger/
  pulse-engine/
  anchor-resolver/
  observer-archive/
  narrative-runtime/
  persistence/
  extension-api/
  ui-kit/
content/
  worlds/empty-world-template/
prisma/
  schema.prisma
  migrations/
docs/
tests/
```

For a developer-oriented map of the codebase, read
[`docs/developer-guide.md`](./docs/developer-guide.md).

## Start

```bash
corepack pnpm install
corepack pnpm dev
```

Then open `http://localhost:3000/demo`.

## Commands

```bash
corepack pnpm dev
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:deploy
corepack pnpm db:push
corepack pnpm content:validate
corepack pnpm test:e2e
```

Use `corepack pnpm check` as the normal pre-commit verification command. It
runs linting, type checks, content validation, Vitest, package declaration
builds, and both Next app builds.

## Add A New World Pack

1. Create `content/worlds/<world-id>/world.yaml`.
2. Follow the `WorldPack` schema from `@lacuna-engine/schema`.
3. Set `schemaVersion: 0.1.0` for the current engine contract.
4. Keep concrete story content inside the pack, never in app components.
5. Keep `enabled: false` until an app or creator workflow explicitly selects it.
6. Run `corepack pnpm content:validate` and `corepack pnpm test`.

## Add A City Module

Add a city module object to the World Pack `cities` array. Include:

- `stateSchema` and `initialState`
- `entryRoles`
- `identityFragments`
- `days`
- `anchors`
- `scenes`
- `prologueActions`
- `placeholderActions`

The app reads these values through `@lacuna-engine/content-loader`; it should
not hardcode module content.

## Add An Entry Role

Add an `EntryRole` with `entryDayId`, `entrySceneId`, `influenceRadius`,
`knowledgeTags`, and `accessTags`. Then map one or more `IdentityFragment`
records to that role.

## Add A Trace Type

Trace types are defined in `packages/schema`. After changing the enum, update
`trace-ledger`, `pulse-engine`, tests, and any Prisma persistence mapping.

## Add Daily Pulse Rules

Daily Pulse rules are numeric effects today. Add trace `effects` and anchor
variant `conditions` / `effects` in the World Pack. The `pulse-engine` applies
trace effects, resolves anchor variants, and returns state before/after.

## Persistence And Sessions

`@lacuna-engine/persistence` wraps Prisma 7, SQLite adapter setup, JSON field mapping, and repository functions for:

- seeding World Packs and City Modules
- saving Player Timelines
- saving Traces, Daily Pulses, and Observer Reports
- creating Runtime Sessions
- settling one Daily Pulse from traces across multiple timelines

Run `corepack pnpm db:migrate` for local schema changes or `corepack pnpm db:deploy` to apply committed migrations. `db:push` is still available for disposable prototype databases. The `/demo` page includes both the in-memory framework flow and a Prisma-backed persisted snapshot action.

Runtime sessions can be inspected and controlled through `GET /api/sessions/:sessionId` and `PATCH /api/sessions/:sessionId` with `status` set to `open`, `paused`, or `archived`.

## Content Validation

`corepack pnpm content:validate` scans `content/worlds` and validates every World Pack. The loader supports both single-file packs and split directories such as `cities/`, `roles/`, `days/`, `anchors/`, `scenes/`, `actions/`, and `prologue-actions/`. Validation checks schema version support, semantic content versions, duplicate IDs, cross-references, state keys used by effects/conditions, prologue action coverage, and orphan anchors/actions.

## Studio

`apps/studio` provides a minimal World Pack workbench: validation status, enabled state, city metrics, structured forms for world constants, state rules, spine, city, scene, action, and anchor fields, raw `world.yaml` editing, save-before-write validation, and refreshed validation results after save.

## Future Extensions

`@lacuna-engine/extension-api` reserves typed hooks for:

- AI narrator adapters
- AI steward / hosted world-management agents
- NPC AI agents
- visual novel layers
- image or media renderers
- text-to-speech adapters
- maps
- mini game layers
- multiplayer accounts
- creator studio tools

The first version exports interfaces only. No AI, image generation, TTS, or
complex visual novel UI is wired into the runtime.
