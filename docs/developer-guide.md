# Developer Guide

This guide is the project map for contributors. It explains where code lives,
which package owns each responsibility, and which commands to run before making
or shipping changes.

## Project Intent

Lacuna Engine is a neutral asynchronous narrative world engine skeleton. The
repo must remain content-neutral: engine code should not embed concrete story
canon, named fictional cities, named characters, chapters, or IP-specific lore.

The included `empty-world-template` is disabled by default and exists only to
exercise the framework flow.

## Top-Level Layout

```txt
apps/
  web/       Reader-facing Next.js demo
  studio/    Creator-facing World Pack review and editing surface
packages/
  schema/               Zod schemas and exported TypeScript types
  content-loader/       File-system World Pack loading and validation
  identity-mapper/      Prologue action to IdentityFragment mapping
  trace-ledger/         Player action to Trace creation
  anchor-resolver/      AnchorVariant condition evaluation
  pulse-engine/         DailyPulse state settlement
  observer-archive/     ObserverReport generation
  narrative-runtime/    Runtime orchestration and sessions
  persistence/          Prisma-backed repositories and services
  extension-api/        Future extension contracts
  ui-kit/               Shared React UI primitives
  kernel/               Thin top-level re-export facade
content/
  worlds/               World Pack files
prisma/
  schema.prisma         SQLite persistence schema
  migrations/           Committed Prisma migrations
tests/
  *.test.ts             Vitest unit/integration tests
  e2e/                  Playwright browser tests
```

## Runtime Flow

The in-memory framework flow is:

1. Load a `WorldPack` with `@lacuna-engine/content-loader`.
2. Select the primary `CityModule`.
3. Record one neutral prologue action: `observe`, `help`, or `hide`.
4. Generate three `IdentityFragment` options.
5. Select a fragment and create a `PlayerTimeline`.
6. Enter the timeline's entry scene.
7. Perform a placeholder action.
8. Create a `Trace`.
9. Run `DailyPulse`.
10. Resolve anchor variants.
11. Generate an `ObserverReport`.

The persisted flow uses the same runtime logic and then stores the resulting
timeline, traces, pulse, report, and runtime session through
`@lacuna-engine/persistence`.

## Package Responsibilities

`@lacuna-engine/schema`

- Owns the canonical data contracts.
- Uses Zod to validate World Packs and runtime records.
- Performs compatibility and cross-reference checks: supported `schemaVersion`,
  semantic `version`, duplicate IDs, missing role/day/scene/action references,
  mismatched `cityId` values, state keys used by conditions/effects, prologue
  action coverage, world constant references, spine anchor references, and
  orphan anchors/actions.

`@lacuna-engine/content-loader`

- Loads World Packs from `content/worlds`.
- Supports single-file packs in `world.yaml`.
- Supports split pack directories: `cities/`, `roles/`, `fragments/`, `days/`,
  `anchors/`, `scenes/`, `actions/`, `traces/`, and `prologue-actions/`.
- Exposes validation helpers used by CLI, tests, and Studio, including source
  validation for editor saves.

`@lacuna-engine/narrative-runtime`

- Orchestrates the neutral framework flow.
- Creates timelines from identity fragments.
- Runs actions and pulse settlement.
- Creates and settles `RuntimeSession` records for multi-timeline aggregation.
- Owns runtime session state transitions for `open`, `paused`, `settled`, and
  `archived`.

`@lacuna-engine/pulse-engine`

- Applies trace and anchor variant effects.
- Evaluates variant trace conditions.
- Applies World Pack state rules using `report`, `clamp`, or `reject`
  enforcement.
- Emits `ruleAudit` entries for downstream reports.

`@lacuna-engine/persistence`

- Initializes Prisma 7 with the `better-sqlite3` adapter.
- Seeds worlds and cities.
- Persists timelines, traces, pulses, observer reports, and runtime sessions.
- Provides `runPersistentFrameworkDemo` for the persisted `/demo` path.
- Provides session snapshot, pause, resume, and archive services.

`apps/web`

- Renders the reader demo at `/demo`.
- Includes both in-memory runtime flow and a Prisma-backed persisted snapshot
  action.
- Exposes `GET /api/sessions/:sessionId` and `PATCH /api/sessions/:sessionId`
  for persisted session inspection and status changes.
- Should stay thin: UI invokes package APIs and should not duplicate engine
  rules.

`apps/studio`

- Lists available World Packs.
- Shows validation status and basic city/module metrics.
- Provides structured forms for common world, city, scene, action, and anchor
  variant fields.
- Edits world constants, state rules, and world spine fields.
- Edits raw `world.yaml` with save-before-write validation.

## Content Development

To add a new World Pack:

1. Create `content/worlds/<world-id>/world.yaml`.
2. Set `schemaVersion: 0.1.0`.
3. Add `constants`, `stateRules`, and `spine` before detailed event content.
4. Keep `enabled: false` until the pack is intentionally selectable.
5. Add city modules either inline or through split directories.
6. Run `corepack pnpm content:validate`.
7. Add or update tests for any new schema behavior.

The loader is intentionally strict. Broken references should fail validation
early instead of surfacing during runtime.

## Persistence Development

Run local database setup before exercising persisted flows:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
```

The default SQLite file is `prisma/dev.db` via `prisma.config.ts` and
`.env.example`. Local database files are ignored by git.

When adding a persisted runtime field:

1. Update `packages/schema`.
2. Update `prisma/schema.prisma`.
3. Add a migration under `prisma/migrations`.
4. Run `corepack pnpm db:generate`.
5. Update mappers in `packages/persistence`.
6. Add integration coverage in `tests/persistence.test.ts`.

## Test Coverage

Current tests cover:

- `tests/engine-flow.test.ts`: full in-memory framework flow.
- `tests/content-validation.test.ts`: strict World Pack validation failures,
  including world rules and spine references.
- `tests/content-loader-split.test.ts`: split World Pack loading.
- `tests/session-flow.test.ts`: multi-timeline session pulse aggregation and
  pause/resume behavior.
- `tests/persistence.test.ts`: Prisma-backed persistence snapshot, timeline
  pulse lookup, and session status round trips.
- `tests/e2e/demo.spec.ts`: browser click-through of `/demo`.

Local `test:e2e` may require system Chromium dependencies. CI installs those
with Playwright's `--with-deps` path.

## Commands

Use these as the normal development entry points:

```bash
corepack pnpm install
corepack pnpm dev
corepack pnpm content:validate
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
corepack pnpm check
```

Use these when touching persistence:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:deploy
corepack pnpm db:push
```

Use this when validating browser behavior:

```bash
corepack pnpm test:e2e
```

## Known Constraints

- The engine currently uses numeric state effects for Daily Pulse settlement.
- Content loading is file-system based.
- No AI narrator, image generation, TTS, visual novel layer, map layer, account
  system, or minigame layer is wired into runtime yet.
- Next/Turbopack may warn about tracing filesystem-based content-loader imports;
  builds currently complete successfully.

## Recommended Next Development Areas

1. Add create/delete/reorder operations to `apps/studio` for content graph
   records.
2. Add authenticated player/session ownership before exposing session APIs to
   real users.
3. Add migration drift checks in CI.
4. Add content graph visualizations for scene/action/anchor relationships.
5. Expand Daily Pulse beyond numeric effects when concrete content requires it.
