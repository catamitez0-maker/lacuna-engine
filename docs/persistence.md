# Persistence

`@lacuna-engine/persistence` is the Prisma-backed boundary for runtime data.

Responsibilities:

- initialize Prisma 7 with the SQLite driver adapter
- seed World Packs and City records
- persist Player Timelines
- persist Traces
- persist Daily Pulses and Observer Reports
- persist Runtime Sessions
- settle a session pulse from aggregated timeline traces

Apps should call this package instead of constructing Prisma clients directly.
