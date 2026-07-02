import type { WorldPack } from "@lacuna-engine/schema";
import { toJson } from "./json";
import type { LacunaPrismaClient } from "./types";

export async function seedWorldPack(
  prisma: LacunaPrismaClient,
  world: WorldPack,
): Promise<void> {
  await prisma.world.upsert({
    where: { id: world.id },
    create: {
      id: world.id,
      name: world.name,
      schemaVersion: world.schemaVersion,
      version: world.version,
      description: world.description,
      enabled: world.enabled,
      constantsJson: toJson(world.constants),
      stateRulesJson: toJson(world.stateRules),
      spineJson: world.spine ? toJson(world.spine) : null,
    },
    update: {
      name: world.name,
      schemaVersion: world.schemaVersion,
      version: world.version,
      description: world.description,
      enabled: world.enabled,
      constantsJson: toJson(world.constants),
      stateRulesJson: toJson(world.stateRules),
      spineJson: world.spine ? toJson(world.spine) : null,
    },
  });

  for (const city of world.cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      create: {
        id: city.id,
        worldId: world.id,
        name: city.name,
        description: city.description,
        stateSchemaJson: toJson(city.stateSchema),
        initialStateJson: toJson(city.initialState),
      },
      update: {
        worldId: world.id,
        name: city.name,
        description: city.description,
        stateSchemaJson: toJson(city.stateSchema),
        initialStateJson: toJson(city.initialState),
      },
    });
  }
}
