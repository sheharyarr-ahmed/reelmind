import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
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

const pool = globalForDb.pool ?? new Pool(buildPoolConfig());

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
