import { join } from "node:path";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader";
import { DemoRuntimeClient } from "./runtime-client";

const CONTENT_DIR = join(/* turbopackIgnore: true */ process.cwd(), "../../content/worlds");

export default function DemoPage() {
  const world = loadEmptyWorldTemplate({ contentDir: CONTENT_DIR });

  return <DemoRuntimeClient templateWorld={world} />;
}
