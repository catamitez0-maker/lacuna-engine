# Content Packs

World content lives under `content/worlds/<world-id>`.

The first repository version includes only `empty-world-template`, a disabled
placeholder pack used to validate the engine flow. It does not contain concrete
fiction, named cities, named characters, chapters, IP, or world lore.

To add a World Pack:

1. Create `content/worlds/<world-id>/world.yaml`.
2. Define neutral schema-compliant city modules, entry roles, days, anchors,
   scenes, actions, and trace effects.
3. Keep the pack disabled until an app or creator workflow explicitly selects it.
4. Run `pnpm test` to validate loading and engine settlement.
