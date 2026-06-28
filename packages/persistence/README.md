# @lacuna-engine/persistence

Prisma-backed persistence for Lacuna Engine runtime data.

This package owns Prisma Client construction, JSON field mapping, World Pack seeding,
player timelines, traces, Daily Pulse records, Observer Reports, and runtime sessions.
Apps should call these repository/service functions instead of initializing Prisma directly.
