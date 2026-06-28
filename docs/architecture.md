# Architecture

Lacuna Engine separates content, runtime logic, persistence, and presentation.

- Content lives in World Packs under `content/worlds`.
- Schemas live in `packages/schema`.
- Runtime modules live in focused packages such as `identity-mapper`,
  `trace-ledger`, `pulse-engine`, and `observer-archive`.
- `packages/narrative-runtime` coordinates the first complete text/data flow.
- `apps/web` loads content and renders state; it does not own engine rules.
- `apps/studio` is reserved for creator tooling.

The first version is intentionally deterministic. Player actions create traces,
traces affect Daily Pulse state, anchors select variants, and observer reports
record the result.
