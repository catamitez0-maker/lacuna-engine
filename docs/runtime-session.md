# Runtime Session

A Runtime Session groups one or more Player Timelines for a city and story day.

The runtime can collect traces from all session timelines, run one Daily Pulse,
and produce one Observer Report for the aggregated result. This is the first
step toward asynchronous multiplayer settlement.

## Statuses

- `open`: timelines can be added and the session can be settled.
- `paused`: the session is resumable, but cannot settle a pulse.
- `settled`: a Daily Pulse has been produced for the current day.
- `archived`: the session is closed for runtime changes.

`@lacuna-engine/narrative-runtime` owns status transition helpers. Persistence
wraps those helpers so apps can pause, resume, archive, and reload sessions from
SQLite without duplicating rules.

## HTTP Surface

`apps/web` exposes:

- `GET /api/sessions/:sessionId`
- `PATCH /api/sessions/:sessionId`

The PATCH body uses a `status` field. Set `paused` to pause, `open` to resume,
and `archived` to close the session.
