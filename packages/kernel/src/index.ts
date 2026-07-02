export {
  loadEmptyWorldTemplate,
  loadWorldPackById,
} from "@lacuna-engine/content-loader/server";
export { runFrameworkDemo } from "@lacuna-engine/narrative-runtime";
export type {
  CityModule,
  DailyPulse,
  IdentityFragment,
  ObserverReport,
  PlayerTimeline,
  Trace,
  WorldPack,
} from "@lacuna-engine/schema";

export function createProjectTagline(): string {
  return "A neutral framework for asynchronous narrative worlds.";
}
