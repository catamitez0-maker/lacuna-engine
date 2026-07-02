# @lacuna-engine/world-authoring

Applies structured authoring patches to editable World Pack records.

This package owns the domain logic for Studio-style edits such as creating,
updating, deleting, and reordering world constants, state rules, and spine
phases. It does not read files, write files, or depend on Next.js.

Callers provide a mutable World Pack source object and a small FormData-like
input. The caller remains responsible for validating and saving the result.

## Module map

- `index.ts` routes incoming structured patch targets and exposes the public API.
- `world.ts` edits top-level World Pack metadata.
- `rules.ts` edits world constants and state rules.
- `spine.ts` edits the world spine and spine phases.
- `city.ts` edits city modules, scenes, placeholder actions, and anchor variants.
- `records.ts` contains shared record lookup, ordering, and numeric map helpers.
- `form.ts` contains small FormData coercion helpers.

The package intentionally avoids persistence, YAML parsing, and UI state. Studio
actions should load the editable source, call this package, validate with
`@lacuna-engine/schema`, and then save through their own boundary.
