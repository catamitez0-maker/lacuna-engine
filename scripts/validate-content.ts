import { validateAllWorldPacks } from "@lacuna-engine/content-loader";

const results = validateAllWorldPacks();

if (results.length === 0) {
  console.log("No World Packs found.");
  process.exit(0);
}

let hasFailure = false;

for (const result of results) {
  if (result.ok) {
    console.log(`OK ${result.worldId}`);
    continue;
  }

  hasFailure = true;
  console.error(`FAIL ${result.worldId}`);
  for (const issue of result.issues) {
    const path = issue.path ? ` (${issue.path})` : "";
    console.error(`  -${path} ${issue.message}`);
  }
}

process.exit(hasFailure ? 1 : 0);
