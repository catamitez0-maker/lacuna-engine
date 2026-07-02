import type { StructuredPatchInput } from "./types";

export function requiredText(
  formData: StructuredPatchInput,
  key: string,
): string {
  return String(formData.get(key) ?? "").trim();
}

export function optionalText(
  formData: StructuredPatchInput,
  key: string,
): string | undefined {
  const value = requiredText(formData, key);
  return value || undefined;
}

export function listText(
  formData: StructuredPatchInput,
  key: string,
): string[] {
  return requiredText(formData, key)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function requiredNumber(
  formData: StructuredPatchInput,
  key: string,
): number {
  const value = Number(formData.get(key));

  if (!Number.isFinite(value)) {
    throw new Error(`Expected numeric value for ${key}`);
  }

  return value;
}

export function optionalNumber(
  formData: StructuredPatchInput,
  key: string,
): number | undefined {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Expected numeric value for ${key}`);
  }

  return value;
}
