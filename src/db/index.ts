import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

type DrizzleDb = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  db: DrizzleDb | undefined;
};

function buildPoolConfig(): PoolConfig {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const connectionString = process.env.SUPABASE_DB_URL;

  if (password && connectionString) {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 5432,
      user: decodeURIComponent(url.username),
      password,
      database: url.pathname.replace(/^\//, "") || "postgres",
    };
  }

  return { connectionString };
}

function getDb(): DrizzleDb {
  if (!globalForDb.db) {
    const pool = globalForDb.pool ?? new Pool(buildPoolConfig());
    if (process.env.NODE_ENV !== "production") {
      globalForDb.pool = pool;
    }
    globalForDb.db = drizzle(pool, { schema });
  }
  return globalForDb.db;
}

// Proxy keeps the `import { db }` API but defers Pool construction until
// first method call — so dotenv loaders that run after import still take
// effect (relevant for tsx scripts that read .env.local at runtime).
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as DrizzleDb;
