import pg from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP POLICY IF EXISTS profiles_insert_self ON profiles;
CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
`;

const client = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
await client.connect();
try {
  await client.query(sql);
  console.log("Profile auto-creation trigger applied.");

  const triggers = await client.query(
    `SELECT tgname, tgrelid::regclass AS table_name
     FROM pg_trigger
     WHERE tgname = 'on_auth_user_created'`,
  );
  console.log("Triggers:", triggers.rows);
} finally {
  await client.end();
}
