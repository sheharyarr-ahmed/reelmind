import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = `
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_traces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS brand_templates_select ON brand_templates;
CREATE POLICY brand_templates_select ON brand_templates
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS brand_templates_insert ON brand_templates;
CREATE POLICY brand_templates_insert ON brand_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS brand_templates_update ON brand_templates;
CREATE POLICY brand_templates_update ON brand_templates
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS brand_templates_delete ON brand_templates;
CREATE POLICY brand_templates_delete ON brand_templates
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS projects_select ON projects;
CREATE POLICY projects_select ON projects
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS projects_insert ON projects;
CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS projects_update ON projects;
CREATE POLICY projects_update ON projects
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS projects_delete ON projects;
CREATE POLICY projects_delete ON projects
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS renders_select ON renders;
CREATE POLICY renders_select ON renders
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS renders_insert ON renders;
CREATE POLICY renders_insert ON renders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS renders_update ON renders;
CREATE POLICY renders_update ON renders
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS renders_delete ON renders;
CREATE POLICY renders_delete ON renders
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS agent_traces_select ON agent_traces;
CREATE POLICY agent_traces_select ON agent_traces
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS agent_traces_insert ON agent_traces;
CREATE POLICY agent_traces_insert ON agent_traces
  FOR INSERT WITH CHECK (auth.uid() = user_id);
`;

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();
try {
  await client.query(sql);
  console.log("RLS policies applied.");

  const smoke = await client.query("SELECT 1 AS ok");
  console.log("Smoke test:", smoke.rows[0]);

  const tables = await client.query(
    `SELECT tablename, rowsecurity
     FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename IN ('profiles','brand_templates','projects','renders','agent_traces')
     ORDER BY tablename`,
  );
  console.log("RLS status:");
  for (const row of tables.rows) {
    console.log(`  ${row.tablename}: rowsecurity=${row.rowsecurity}`);
  }
} finally {
  await client.end();
}
