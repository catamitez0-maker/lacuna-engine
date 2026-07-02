# Persistence

`@lacuna-engine/persistence` is the Prisma-backed boundary for runtime data.

Responsibilities:

- initialize Prisma 7 with the SQLite driver adapter
- seed World Packs and City records
- persist World Pack constants, state rules, and spine metadata as JSON
- persist Player Timelines
- persist Traces
- persist Daily Pulses and Observer Reports
- persist Daily Pulse rule audits and Observer Report rule audit summaries
- persist Runtime Sessions
- settle a session pulse from aggregated timeline traces
- load a complete Runtime Session snapshot
- load a timeline snapshot by matching pulses through Trace IDs
- pause, resume, and archive Runtime Sessions

Apps should call this package instead of constructing Prisma clients directly.

## Internal Modules

The package is split by responsibility:

- `client.ts` creates Prisma clients.
- `types.ts` defines persisted snapshot contracts.
- `json.ts` centralizes JSON encoding and decoding.
- `mappers.ts` validates Prisma rows back into schema objects.
- `repositories.ts` owns save/load/session operations.
- `demo.ts` keeps demo orchestration out of repository primitives.

World constants, state rules, spine data, rule audit entries, and observer audit
summaries are currently stored as JSON columns. This keeps early content
iteration flexible. If these fields become common query dimensions, migrate them
into normalized tables instead of continuing to grow JSON blobs.

## Commands

Use migrations for durable local and deployed databases:

```bash
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm db:deploy
```

`corepack pnpm db:push` remains available for disposable prototype databases.

## Session API

`apps/web` exposes a small persisted-session API:

- `GET /api/sessions/:sessionId` returns the session, timelines, traces,
  pulses, and observer reports.
- `PATCH /api/sessions/:sessionId` accepts `{ "status": "paused" }`,
  `{ "status": "open" }`, or `{ "status": "archived" }`.
