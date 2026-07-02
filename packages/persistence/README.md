# @lacuna-engine/persistence

Prisma-backed persistence for Lacuna Engine runtime data.

This package owns Prisma Client construction, JSON field mapping, World Pack seeding,
player timelines, traces, Daily Pulse records, Observer Reports, and runtime sessions.
Apps should call these repository/service functions instead of initializing Prisma directly.

## Module map

- `client.ts` creates Prisma clients for SQLite.
- `json.ts` centralizes JSON field serialization.
- `mappers.ts` converts Prisma rows back into schema types.
- `world-repository.ts` seeds World Pack and City records.
- `timeline-repository.ts` stores players/timelines and loads timeline snapshots.
- `event-repository.ts` stores traces, pulses, reports, and session trace lists.
- `session-repository.ts` stores runtime sessions and session snapshots.
- `demo.ts` persists the neutral framework demo flow.
- `repositories.ts` remains the compatibility facade for repository exports.
