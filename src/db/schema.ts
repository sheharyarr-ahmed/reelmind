import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================================
// Profiles Table
// ============================================================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Brand Templates Table
// ============================================================================

export const brandTemplates = pgTable("brand_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  primaryColor: varchar("primary_color", { length: 7 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 7 }).notNull(),
  accentColor: varchar("accent_color", { length: 7 }).notNull(),
  headingFont: varchar("heading_font", { length: 255 }).notNull(),
  bodyFont: varchar("body_font", { length: 255 }).notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Projects Table
// ============================================================================

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  brandTemplateId: uuid("brand_template_id").notNull(),
  script: text("script").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Renders Table (3 aspect ratios per project)
// ============================================================================

export const renders = pgTable("renders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  projectId: uuid("project_id").notNull(),
  aspectRatio: varchar("aspect_ratio", { length: 10 }).notNull(), // 16x9, 9x16, 1x1
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, rendering, completed, failed
  videoUrl: text("video_url"),
  errorMessage: text("error_message"),
  expiresAt: timestamp("expires_at"), // 7 days after creation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// Agent Traces Table (Observability)
// ============================================================================

export const agentTraces = pgTable("agent_traces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  projectId: uuid("project_id"),
  nodeName: varchar("node_name", { length: 255 }).notNull(),
  inputState: jsonb("input_state"),
  outputState: jsonb("output_state"),
  llmCall: boolean("llm_call").default(false),
  tokensUsed: integer("tokens_used"),
  durationMs: integer("duration_ms"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// RLS Policy SQL (to be applied after table creation)
// ============================================================================

export const rlsPolicies = sql`
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE renders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_traces ENABLE ROW LEVEL SECURITY;

-- Profiles: authenticated users can only read their own profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Brand Templates: authenticated users can only access their own templates
CREATE POLICY brand_templates_select ON brand_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY brand_templates_insert ON brand_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY brand_templates_update ON brand_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY brand_templates_delete ON brand_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Projects: authenticated users can only access their own projects
CREATE POLICY projects_select ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Renders: authenticated users can only access their own renders
CREATE POLICY renders_select ON renders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY renders_insert ON renders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY renders_update ON renders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY renders_delete ON renders
  FOR DELETE USING (auth.uid() = user_id);

-- Agent Traces: authenticated users can only access their own traces
CREATE POLICY agent_traces_select ON agent_traces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY agent_traces_insert ON agent_traces
  FOR INSERT WITH CHECK (auth.uid() = user_id);
`;
