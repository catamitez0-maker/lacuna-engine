export type StructuredRecord = Record<string, unknown>;

export type StructuredPatchInput = {
  get(key: string): unknown;
  getAll(key: string): unknown[];
};

export type ApplyStructuredPatchResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type EditableRecordLookup =
  | { record: StructuredRecord }
  | { error: ApplyStructuredPatchResult };
