import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadEmptyWorldTemplate } from "@lacuna-engine/content-loader/server";
import {
  createEmptyExtensionRegistry,
  createManualAiProposalReview,
  createMockAiStewardAgent,
  createMockNpcAgent,
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
    const steward = createMockAiStewardAgent("reserved-steward");
    const npc = createMockNpcAgent("reserved-npc-agent");
    const stewardProposal = await steward.propose({
      world,
      city,
      task: "world_health_check",
    });

    expect(stewardProposal).toMatchObject({
      extensionId: "reserved-steward",
      payload: {
        payload: {
          task: "world_health_check",
        },
      },
    });
    expect(createManualAiProposalReview(stewardProposal.payload)).toMatchObject(
      {
        status: "ready_for_human_review",
        canApply: false,
        requiresHumanApproval: true,
      },
    );
    await expect(
      npc.proposeAction({
        world,
        city,
        npcId: "placeholder-npc",
        availableActionIds: ["placeholder-action-record"],
      }),
    ).resolves.toMatchObject({
      extensionId: "reserved-npc-agent",
      payload: {
        payload: {
          npcId: "placeholder-npc",
          actionId: "placeholder-action-record",
          intent: "observe",
        },
      },
    });
  });
});
