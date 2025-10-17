-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  catalog_number TEXT NOT NULL,
  title TEXT,
  units NUMERIC,
  description TEXT,
  level INT GENERATED ALWAYS AS (
    CASE 
      WHEN catalog_number ~ '^\d+' THEN (SUBSTRING(catalog_number FROM '^\d+')::INT / 100 * 100)
      ELSE 0
    END
  ) STORED,
  terms_offered TEXT[],
  faculty TEXT,
  raw_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject, catalog_number)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty);
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses USING GIN (
  to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(catalog_number, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- Relation types enum
DO $$ BEGIN
  CREATE TYPE relation_type AS ENUM ('PREREQ', 'COREQ', 'ANTIREQ', 'EQUIV');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Course relations table
CREATE TABLE IF NOT EXISTS course_relations (
  id BIGSERIAL PRIMARY KEY,
  source_course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  target_course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  rtype relation_type NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_relations_source ON course_relations(source_course_id);
CREATE INDEX IF NOT EXISTS idx_course_relations_target ON course_relations(target_course_id);
CREATE INDEX IF NOT EXISTS idx_course_relations_type ON course_relations(rtype);

-- Logic types for AND/OR prerequisite trees
DO $$ BEGIN
  CREATE TYPE logic_type AS ENUM ('AND', 'OR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Relation groups for complex prerequisite logic
CREATE TABLE IF NOT EXISTS relation_groups (
  group_id BIGSERIAL PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  rtype relation_type NOT NULL,
  ltype logic_type NOT NULL,
  member_course_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relation_groups_course ON relation_groups(course_id);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);

-- Plan items (courses in a plan)
CREATE TABLE IF NOT EXISTS plan_items (
  plan_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(plan_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(course_id),
  term TEXT,
  pos_x NUMERIC,
  pos_y NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_course ON plan_items(course_id);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
  checklist_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(plan_id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  group_key TEXT,
  required_count INT,
  parent_id UUID REFERENCES checklist_items(checklist_item_id) ON DELETE CASCADE,
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_plan ON checklist_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_parent ON checklist_items(parent_id);

-- ETL runs tracking
CREATE TABLE IF NOT EXISTS etl_runs (
  run_id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT,
  added INT DEFAULT 0,
  updated INT DEFAULT 0,
  errors JSONB,
  cursor TEXT
);

CREATE INDEX IF NOT EXISTS idx_etl_runs_started ON etl_runs(started_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

