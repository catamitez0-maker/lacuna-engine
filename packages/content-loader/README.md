# @lacuna-engine/content-loader

Parses and validates World Packs with `@lacuna-engine/schema`.

Use the root package for pure YAML/JSON source validation:

```ts
import { validateWorldPackSource } from "@lacuna-engine/content-loader";
```

Use the server subpath for Node file-system loading and split-pack hydration:

```ts
import { loadWorldPackById } from "@lacuna-engine/content-loader/server";
```

Server callers pass an explicit `contentDir` so Next builds do not need dynamic
workspace discovery.
