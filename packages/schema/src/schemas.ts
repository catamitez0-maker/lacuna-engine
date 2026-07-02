import { z } from "zod";
import { worldPackSchema } from "./world-schemas";

export * from "./base-schemas";
export * from "./runtime-schemas";
export * from "./world-schemas";

export function parseWorldPack(
  input: unknown,
): z.infer<typeof worldPackSchema> {
  return worldPackSchema.parse(input);
}
