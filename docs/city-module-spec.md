# City Module Spec

A City Module is the local narrative container inside a World Pack.

Required fields:

- `id`
- `name`
- `stateSchema`
- `initialState`
- `entryRoles`
- `identityFragments`
- `days`
- `anchors`
- `scenes`
- `prologueActions`
- `placeholderActions`

The first version treats state as numeric keys so trace and anchor effects can
settle predictably.
