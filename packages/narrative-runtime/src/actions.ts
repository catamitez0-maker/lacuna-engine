import { type Trace } from "@lacuna-engine/schema";
import { createTraceFromAction } from "@lacuna-engine/trace-ledger";
import { findById } from "./entities";
import type { RuntimeActionInput } from "./types";

export function performRuntimeAction({
  city,
  timeline,
  actionId,
  now,
  sequence,
}: RuntimeActionInput): Trace {
  const action = findById(
    city.placeholderActions,
    actionId,
    "placeholder action",
  );

  return createTraceFromAction({
    timeline,
    action,
    now,
    sequence,
  });
}
