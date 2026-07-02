import { requiredNumber } from "./form";
import { failure, success } from "./result";
import type {
  ApplyStructuredPatchResult,
  EditableRecordLookup,
  StructuredPatchInput,
  StructuredRecord,
} from "./types";

export function findEditableRecord(
  parent: StructuredRecord,
  key: string,
  id: string,
  label: string,
): EditableRecordLookup {
  const records = asRecordArray(parent[key]);
  const record = records.find((candidate) => candidate["id"] === id);

  if (!record) {
    return {
      error: failure(`Selected ${label} ${id} is not editable in world.yaml.`),
    };
  }

  return {
    record,
  };
}

export function deleteEditableRecord(
  parent: StructuredRecord,
  key: string,
  id: string,
  label: string,
  message: string,
  options: { renumberOrder?: boolean } = {},
): ApplyStructuredPatchResult {
  const records = editableRecordArray(parent, key, label);
  const index = records.findIndex((candidate) => candidate["id"] === id);

  if (index < 0) {
    return failure(`Selected ${label} ${id} is not editable in world.yaml.`);
  }

  records.splice(index, 1);
  if (options.renumberOrder) {
    renumberRecordOrders(records);
  }

  return success(message);
}

export function moveEditableRecord(
  parent: StructuredRecord,
  key: string,
  id: string,
  label: string,
  direction: -1 | 1,
  message: string,
  options: { renumberOrder?: boolean } = {},
): ApplyStructuredPatchResult {
  const records = editableRecordArray(parent, key, label);
  const index = records.findIndex((candidate) => candidate["id"] === id);

  if (index < 0) {
    return failure(`Selected ${label} ${id} is not editable in world.yaml.`);
  }

  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= records.length) {
    return failure(
      `${label} ${id} is already ${direction < 0 ? "first" : "last"}.`,
    );
  }

  const current = records[index]!;
  records[index] = records[nextIndex]!;
  records[nextIndex] = current;
  if (options.renumberOrder) {
    renumberRecordOrders(records);
  }

  return success(message);
}

export function updateNumericRecord(
  current: StructuredRecord | null,
  formData: StructuredPatchInput,
  keyField: string,
  valuePrefix: string,
): StructuredRecord {
  const next = { ...(current ?? {}) };

  for (const key of formData.getAll(keyField).map(String)) {
    next[key] = requiredNumber(formData, `${valuePrefix}:${key}`);
  }

  return next;
}

export function setOptionalNumber(
  record: StructuredRecord,
  key: string,
  value: number | undefined,
): void {
  if (value === undefined) {
    delete record[key];
    return;
  }

  record[key] = value;
}

export function asRecord(value: unknown): StructuredRecord | null {
  return isRecord(value) ? value : null;
}

export function editableRecordArray(
  parent: StructuredRecord,
  key: string,
  label: string,
): StructuredRecord[] {
  if (parent[key] === undefined) {
    parent[key] = [];
  }

  if (!Array.isArray(parent[key])) {
    throw new Error(`${label} must be an array.`);
  }

  const records = parent[key];
  if (!records.every(isRecord)) {
    throw new Error(`${label} can only contain object records.`);
  }

  return records;
}

export function asRecordArray(value: unknown): StructuredRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function nextPhaseOrder(phases: StructuredRecord[]): number {
  return Math.max(0, ...phases.map((phase) => Number(phase["order"]) || 0)) + 1;
}

function renumberRecordOrders(records: StructuredRecord[]): void {
  records.forEach((record, index) => {
    record["order"] = index + 1;
  });
}

function isRecord(value: unknown): value is StructuredRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
