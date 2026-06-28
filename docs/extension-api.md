# Extension API

`@lacuna-engine/extension-api` reserves contracts for future layers:

- AI narrator
- visual novel presenter
- media renderer
- TTS
- map layer
- mini game layer
- account or multiplayer service
- creator tooling

The first version does not connect any of these systems. Adapters should consume
engine context, traces, scenes, and observer reports without mutating core
content directly.
