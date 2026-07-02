import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import {
  createEmptyExtensionRegistry,
  type AiStewardAgent,
  type NpcAgent,
} from "@lacuna-engine/extension-api";

const CONTENT_DIR = join(process.cwd(), "content/worlds");

describe("extension API AI reservations", () => {
  it("reserves empty AI steward and NPC agent slots in the registry", () => {
    expect(createEmptyExtensionRegistry()).toMatchObject({
      aiStewards: [],
      npcAgents: [],
      narrators: [],
      visualNovelLayers: [],
      mediaRenderers: [],
      miniGames: [],
    });
  });

  it("allows provider-agnostic AI steward and NPC agent proposals", async () => {
    const world = loadEmptyWorldTemplate({ contentDir: CONTENT_DIR });
    const city = world.cities[0]!;
    const provider = {
      id: "reserved-provider",
      label: "Reserved Provider",
      executionMode: "manual" as const,
      capabilities: ["structured_output" as const],
    };
    const safety = {
      canMutateWorld: false as const,
      canPersistChanges: false as const,
      canCallExternalTools: false,
      requiresHumanApproval: true,
    };
    const steward: AiStewardAgent = {
      id: "reserved-steward",
      provider,
      safety,
      async propose(input) {
        return {
          extensionId: this.id,
          payload: {
            id: `${input.world.id}-health-proposal`,
            title: "Reserved world health proposal",
            summary: "A future steward would review the content graph.",
            payload: {
              task: input.task,
              suggestions: [],
            },
            audit: {
              providerId: provider.id,
              confidence: 0,
              warnings: ["No model is connected."],
            },
          },
        };
      },
    };
    const npc: NpcAgent = {
      id: "reserved-npc-agent",
      provider,
      safety,
      async proposeAction(input) {
        return {
          extensionId: this.id,
          payload: {
            id: `${input.npcId}-action-proposal`,
            title: "Reserved NPC action proposal",
            summary: "A future NPC agent would propose intent and effects.",
            payload: {
              npcId: input.npcId,
              intent: "observe",
              rationale: "No model is connected.",
            },
            audit: {
              providerId: provider.id,
              confidence: 0,
            },
          },
        };
      },
    };

    await expect(
      steward.propose({ world, city, task: "world_health_check" }),
    ).resolves.toMatchObject({
      extensionId: "reserved-steward",
      payload: {
        payload: {
          task: "world_health_check",
          suggestions: [],
        },
      },
    });
    await expect(
      npc.proposeAction({ world, city, npcId: "placeholder-npc" }),
    ).resolves.toMatchObject({
      extensionId: "reserved-npc-agent",
      payload: {
        payload: {
          npcId: "placeholder-npc",
          intent: "observe",
        },
      },
    });
  });
});
