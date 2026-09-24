import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

export type Db = LibSQLDatabase<typeof schema>;

type Cache = { client?: Client; db?: Db; ready?: Promise<Db> };
const globalCache = globalThis as unknown as { __mhcsDb?: Cache };
const cache: Cache = (globalCache.__mhcsDb ??= {});

function resolveUrl(): string {
  const url = process.env.DATABASE_URL?.trim() || "file:./data/local.db";
  if (url.startsWith("file:")) {
    // Make sure the folder for a local SQLite file exists before libsql opens it.
    const filePath = url.slice("file:".length);
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    return `file:${absolute}`;
  }
  return url;
}

function createDb(): Db {
  if (cache.db) return cache.db;
  const client = createClient({
    url: resolveUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  cache.client = client;
  cache.db = drizzle(client, { schema });
  return cache.db;
}

/**
 * Returns the Drizzle database, running pending migrations exactly once per process.
 * Every query helper awaits this, so a fresh checkout works with zero manual setup.
 */
export function getDb(): Promise<Db> {
  if (!cache.ready) {
    const db = createDb();
    cache.ready = migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") })
      .then(() => db)
      .catch((error) => {
        cache.ready = undefined;
        throw error;
      });
  }
  return cache.ready;
}

export { schema };
