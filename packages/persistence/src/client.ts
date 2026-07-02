import { createRequire } from "node:module";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import type { PrismaClient as PrismaClientType } from "@prisma/client";
import type { LacunaPrismaClient, PersistenceOptions } from "./types";

const require = createRequire(import.meta.url);
const { PrismaClient } =
  require("@prisma/client") as typeof import("@prisma/client");

declare global {
  // eslint-disable-next-line no-var
  var __lacunaPrisma: LacunaPrismaClient | undefined;
}

export function createPrismaClient({
  databaseUrl = process.env["DATABASE_URL"] ?? "file:./dev.db",
}: PersistenceOptions = {}): LacunaPrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

export function getPrismaClient(
  options: PersistenceOptions = {},
): LacunaPrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient(options);
  }

  globalThis.__lacunaPrisma ??= createPrismaClient(options);
  return globalThis.__lacunaPrisma;
}
