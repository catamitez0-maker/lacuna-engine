# World Pack Spec

A World Pack is a versioned content bundle:

- `id`
- `name`
- `version`
- `description`
- `enabled`
- `cities`

World Packs can contain city modules, entry roles, days, anchors, scenes,
placeholder actions, and archive data. A pack may be disabled and still loaded
by tests or explicit demo flows.

Do not place concrete content in engine packages. Content belongs in pack files
so apps can switch packs without changing runtime code.
