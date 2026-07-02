export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export function fromJson<T = unknown>(value: string): T {
  return JSON.parse(value) as T;
}
