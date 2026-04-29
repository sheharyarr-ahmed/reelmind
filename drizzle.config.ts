import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = new URL(process.env.SUPABASE_DB_URL!);
const password = process.env.SUPABASE_DB_PASSWORD ?? decodeURIComponent(url.password);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 5432,
    user: decodeURIComponent(url.username),
    password,
    database: url.pathname.replace(/^\//, "") || "postgres",
    ssl: "require",
  },
});
