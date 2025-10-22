-- -----------------------------------------------------------------------------
-- 0001_create_courses_table.sql — Create courses table for UWPlanit
-- -----------------------------------------------------------------------------

-- Create the courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  units DECIMAL(3,1),
  prerequisites TEXT[],
  corequisites TEXT[],
  antirequisites TEXT[],
  terms TEXT[],
  department TEXT NOT NULL,
  level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_department ON public.courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_terms ON public.courses USING GIN(terms);

-- Enable Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all users to read courses
CREATE POLICY "Allow public read access to courses" ON public.courses
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert/update courses
-- (useful for admin operations)
CREATE POLICY "Allow authenticated users to manage courses" ON public.courses
  FOR ALL USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE public.courses IS 'University course catalog data for UWPlanit';
COMMENT ON COLUMN public.courses.id IS 'Unique course identifier (e.g., ACC610)';
COMMENT ON COLUMN public.courses.code IS 'Course code (e.g., ACC 610)';
COMMENT ON COLUMN public.courses.name IS 'Full course name';
COMMENT ON COLUMN public.courses.description IS 'Course description';
COMMENT ON COLUMN public.courses.units IS 'Credit units for the course';
COMMENT ON COLUMN public.courses.prerequisites IS 'Array of prerequisite course IDs';
COMMENT ON COLUMN public.courses.corequisites IS 'Array of corequisite course IDs';
COMMENT ON COLUMN public.courses.antirequisites IS 'Array of antirequisite course IDs';
COMMENT ON COLUMN public.courses.terms IS 'Array of terms when course is offered';
COMMENT ON COLUMN public.courses.department IS 'Department code (e.g., ACC)';
COMMENT ON COLUMN public.courses.level IS 'Course level (100, 200, 300, etc.)';