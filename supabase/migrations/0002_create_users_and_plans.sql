-- -----------------------------------------------------------------------------
-- 0002_create_users_and_plans.sql — User profiles and course planning tables
-- -----------------------------------------------------------------------------

-- Create users table to store user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Auth0 user ID (sub)
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  program TEXT, -- e.g., "Computer Science", "Software Engineering"
  current_term TEXT, -- e.g., "1A", "2B", "3A"
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_plans table to store user course plans
CREATE TABLE IF NOT EXISTS public.course_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "My 4-Year Plan", "Co-op Stream Plan"
  description TEXT,
  is_active BOOLEAN DEFAULT true, -- Allow users to have multiple plans, mark one as active
  start_term TEXT, -- e.g., "1A"
  start_year INTEGER, -- e.g., 2024
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plan_courses junction table to link courses to plans
CREATE TABLE IF NOT EXISTS public.plan_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.course_plans(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  term TEXT NOT NULL, -- e.g., "1A", "2B", "3A"
  year INTEGER, -- e.g., 2024, 2025
  term_order INTEGER, -- Order within the term (for sorting)
  notes TEXT, -- Optional notes for this course in the plan
  is_completed BOOLEAN DEFAULT false,
  grade TEXT, -- Optional grade if completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, course_id) -- A course can only appear once per plan
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_course_plans_user_id ON public.course_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_course_plans_is_active ON public.course_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plan_courses_plan_id ON public.plan_courses(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_courses_course_id ON public.plan_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_plan_courses_term ON public.plan_courses(term);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.jwt() ->> 'sub' = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.jwt() ->> 'sub' = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = id);

-- RLS Policies for course_plans table
-- Users can read their own plans
CREATE POLICY "Users can read own plans" ON public.course_plans
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Users can create their own plans
CREATE POLICY "Users can create own plans" ON public.course_plans
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update own plans" ON public.course_plans
  FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete own plans" ON public.course_plans
  FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- RLS Policies for plan_courses table
-- Users can read courses from their own plans
CREATE POLICY "Users can read own plan courses" ON public.plan_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_plans
      WHERE course_plans.id = plan_courses.plan_id
      AND course_plans.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can add courses to their own plans
CREATE POLICY "Users can add courses to own plans" ON public.plan_courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_plans
      WHERE course_plans.id = plan_courses.plan_id
      AND course_plans.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can update courses in their own plans
CREATE POLICY "Users can update courses in own plans" ON public.plan_courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.course_plans
      WHERE course_plans.id = plan_courses.plan_id
      AND course_plans.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can delete courses from their own plans
CREATE POLICY "Users can delete courses from own plans" ON public.plan_courses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.course_plans
      WHERE course_plans.id = plan_courses.plan_id
      AND course_plans.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_plans_updated_at
  BEFORE UPDATE ON public.course_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_courses_updated_at
  BEFORE UPDATE ON public.plan_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'User profiles synced with Auth0';
COMMENT ON COLUMN public.users.id IS 'Auth0 user ID (sub claim from JWT)';
COMMENT ON COLUMN public.users.email IS 'User email address';
COMMENT ON COLUMN public.users.name IS 'User full name';
COMMENT ON COLUMN public.users.program IS 'Academic program (e.g., Computer Science)';
COMMENT ON COLUMN public.users.current_term IS 'Current or upcoming term (e.g., 1A, 2B)';

COMMENT ON TABLE public.course_plans IS 'User course plans for academic planning';
COMMENT ON COLUMN public.course_plans.user_id IS 'Reference to user who owns this plan';
COMMENT ON COLUMN public.course_plans.name IS 'Plan name (e.g., "My 4-Year Plan")';
COMMENT ON COLUMN public.course_plans.is_active IS 'Whether this is the user active plan';
COMMENT ON COLUMN public.course_plans.start_term IS 'Starting term for this plan';
COMMENT ON COLUMN public.course_plans.start_year IS 'Starting year for this plan';

COMMENT ON TABLE public.plan_courses IS 'Junction table linking courses to plans with scheduling info';
COMMENT ON COLUMN public.plan_courses.plan_id IS 'Reference to course plan';
COMMENT ON COLUMN public.plan_courses.course_id IS 'Reference to course';
COMMENT ON COLUMN public.plan_courses.term IS 'Term when course is planned (e.g., 1A, 2B)';
COMMENT ON COLUMN public.plan_courses.year IS 'Year when course is planned';
COMMENT ON COLUMN public.plan_courses.term_order IS 'Order within term for display';
COMMENT ON COLUMN public.plan_courses.is_completed IS 'Whether student has completed this course';
COMMENT ON COLUMN public.plan_courses.grade IS 'Final grade if completed';

