import type { ApplyStructuredPatchResult } from "./types";

export function success(message: string): ApplyStructuredPatchResult {
  return { ok: true, message };
}

export function failure(message: string): ApplyStructuredPatchResult {
  return { ok: false, message };
}
