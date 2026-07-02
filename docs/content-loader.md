# Content Loader

`@lacuna-engine/content-loader` now has two boundaries:

- `@lacuna-engine/content-loader` is the pure source boundary. It parses YAML or
  JSON strings, validates inline World Pack records, and exports shared
  validation result types. It does not read from the file system.
- `@lacuna-engine/content-loader/server` is the Node-only file-system boundary.
  It reads `content/worlds`, hydrates split World Pack directories, and powers
  CLI validation, tests, Studio, and server-rendered demo loading.

The content loader supports two World Pack shapes.

Single-file packs keep full city modules inside `world.yaml`. Split packs can put
records into directories:

- `cities/`
- `roles/`
- `fragments/`
- `days/`
- `anchors/`
- `scenes/`
- `actions/`
- `traces/`
- `prologue-actions/`

Server loader callers must pass an explicit `contentDir`. This keeps Next builds
from tracing the whole workspace through dynamic `process.cwd()` discovery.

Run `corepack pnpm content:validate` before committing content changes.

Studio uses the same loader boundary to read `world.yaml` and validate both
structured form edits and raw source edits before saving. Keep new content
sources behind this package so CLI, tests, Studio, and runtime keep one
validation path.

Validation includes schema compatibility, semantic content versions,
cross-references, state key usage, prologue action coverage, and orphan
anchor/action detection.
