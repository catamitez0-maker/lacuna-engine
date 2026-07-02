# @lacuna-engine/schema

Zod schemas and TypeScript types for World Packs, world constants, state rules,
world spine, City Modules, timelines, traces, pulses, anchor variants, and
observer reports.

This package also owns World Pack compatibility rules and strict content graph
checks such as duplicate IDs, missing references, state key usage, prologue
action coverage, and orphan anchor/action detection.

Extend this package before adding new data files or runtime behavior so every
loader and engine module validates the same contract.

## Module map

- `base-schemas.ts` contains schema versions, enums, and primitive state shapes.
- `world-schemas.ts` contains World Pack, city, spine, anchor, rule, and content graph schemas.
- `runtime-schemas.ts` contains timeline, trace, pulse, observer report, and runtime session schemas.
- `validation.ts` contains shared graph validation helpers.
- `schemas.ts` is the public schema facade and exposes `parseWorldPack`.
- `types.ts` derives public TypeScript types from the Zod schemas.
