-- Example Queries for UWPlanit Database
-- These queries demonstrate how to interact with the user and course planning tables

-- ============================================================================
-- User Profile Queries
-- ============================================================================

-- Get user profile by Auth0 ID
SELECT * FROM public.users WHERE id = 'auth0|123456789';

-- Get all users (admin only)
SELECT 
  id,
  email,
  name,
  program,
  current_term,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- Update user profile
UPDATE public.users
SET 
  name = 'John Doe',
  program = 'Computer Science',
  current_term = '2A',
  updated_at = NOW()
WHERE id = 'auth0|123456789';

-- ============================================================================
-- Course Plan Queries
-- ============================================================================

-- Get all plans for a user
SELECT * FROM public.course_plans
WHERE user_id = 'auth0|123456789'
ORDER BY is_active DESC, created_at DESC;

-- Get active plan for a user
SELECT * FROM public.course_plans
WHERE user_id = 'auth0|123456789'
AND is_active = true
LIMIT 1;

-- Create a new course plan
INSERT INTO public.course_plans (user_id, name, description, start_term, start_year, is_active)
VALUES ('auth0|123456789', 'My 4-Year Plan', 'Standard CS program', '1A', 2024, true)
RETURNING *;

-- Update a course plan
UPDATE public.course_plans
SET 
  name = 'Updated Plan Name',
  description = 'Updated description',
  is_active = true,
  updated_at = NOW()
WHERE id = 'plan-uuid-here'
AND user_id = 'auth0|123456789';

-- Set a plan as active (and deactivate others)
BEGIN;
  -- Deactivate all plans for user
  UPDATE public.course_plans
  SET is_active = false
  WHERE user_id = 'auth0|123456789';
  
  -- Activate the selected plan
  UPDATE public.course_plans
  SET is_active = true
  WHERE id = 'plan-uuid-here'
  AND user_id = 'auth0|123456789';
COMMIT;

-- ============================================================================
-- Plan Courses Queries
-- ============================================================================

-- Get all courses in a plan with course details
SELECT 
  pc.*,
  c.code,
  c.name,
  c.description,
  c.units,
  c.department,
  c.level,
  c.prerequisites,
  c.corequisites,
  c.antirequisites,
  c.terms
FROM public.plan_courses pc
JOIN public.courses c ON c.id = pc.course_id
WHERE pc.plan_id = 'plan-uuid-here'
ORDER BY pc.year, pc.term, pc.term_order;

-- Get courses grouped by term
SELECT 
  pc.term,
  pc.year,
  COUNT(*) as course_count,
  SUM(c.units) as total_units,
  ARRAY_AGG(c.code ORDER BY pc.term_order) as courses
FROM public.plan_courses pc
JOIN public.courses c ON c.id = pc.course_id
WHERE pc.plan_id = 'plan-uuid-here'
GROUP BY pc.term, pc.year
ORDER BY pc.year, pc.term;

-- Add a course to a plan
INSERT INTO public.plan_courses (plan_id, course_id, term, year, term_order)
VALUES ('plan-uuid-here', 'CS136', '1B', 2024, 1)
RETURNING *;

-- Update course in plan (change term/year)
UPDATE public.plan_courses
SET 
  term = '2A',
  year = 2025,
  term_order = 2,
  updated_at = NOW()
WHERE id = 'plan-course-uuid-here';

-- Mark course as completed
UPDATE public.plan_courses
SET 
  is_completed = true,
  grade = 'A',
  updated_at = NOW()
WHERE id = 'plan-course-uuid-here';

-- Remove a course from a plan
DELETE FROM public.plan_courses
WHERE id = 'plan-course-uuid-here';

-- ============================================================================
-- Advanced Queries
-- ============================================================================

-- Get completion statistics for a plan
SELECT 
  COUNT(*) as total_courses,
  COUNT(*) FILTER (WHERE is_completed = true) as completed_courses,
  ROUND(COUNT(*) FILTER (WHERE is_completed = true)::DECIMAL / COUNT(*) * 100, 2) as completion_percentage,
  SUM(c.units) as total_units,
  SUM(c.units) FILTER (WHERE pc.is_completed = true) as completed_units
FROM public.plan_courses pc
JOIN public.courses c ON c.id = pc.course_id
WHERE pc.plan_id = 'plan-uuid-here';

-- Get all courses for a specific term in a plan
SELECT 
  c.code,
  c.name,
  c.units,
  pc.notes,
  pc.is_completed,
  pc.grade
FROM public.plan_courses pc
JOIN public.courses c ON c.id = pc.course_id
WHERE pc.plan_id = 'plan-uuid-here'
AND pc.term = '2A'
AND pc.year = 2025
ORDER BY pc.term_order;

-- Find prerequisite violations in a plan
-- (Courses scheduled before their prerequisites)
WITH plan_course_schedule AS (
  SELECT 
    pc.course_id,
    pc.term,
    pc.year,
    c.prerequisites,
    c.code
  FROM public.plan_courses pc
  JOIN public.courses c ON c.id = pc.course_id
  WHERE pc.plan_id = 'plan-uuid-here'
)
SELECT 
  pcs.code as course,
  pcs.term,
  pcs.year,
  unnest(pcs.prerequisites) as prerequisite_id,
  prereq_courses.code as prerequisite_code
FROM plan_course_schedule pcs
CROSS JOIN LATERAL unnest(pcs.prerequisites) AS prereq_id
JOIN public.courses prereq_courses ON prereq_courses.id = prereq_id
LEFT JOIN plan_course_schedule prereq_schedule 
  ON prereq_schedule.course_id = prereq_id
WHERE 
  -- Prerequisite not in plan OR scheduled after the course
  prereq_schedule.course_id IS NULL 
  OR (prereq_schedule.year > pcs.year)
  OR (prereq_schedule.year = pcs.year AND prereq_schedule.term >= pcs.term);

-- Get department distribution in a plan
SELECT 
  c.department,
  COUNT(*) as course_count,
  SUM(c.units) as total_units
FROM public.plan_courses pc
JOIN public.courses c ON c.id = pc.course_id
WHERE pc.plan_id = 'plan-uuid-here'
GROUP BY c.department
ORDER BY course_count DESC;

-- Get all plans with their course count and total units
SELECT 
  cp.id,
  cp.name,
  cp.user_id,
  cp.is_active,
  COUNT(pc.id) as course_count,
  SUM(c.units) as total_units
FROM public.course_plans cp
LEFT JOIN public.plan_courses pc ON pc.plan_id = cp.id
LEFT JOIN public.courses c ON c.id = pc.course_id
WHERE cp.user_id = 'auth0|123456789'
GROUP BY cp.id, cp.name, cp.user_id, cp.is_active
ORDER BY cp.is_active DESC, cp.created_at DESC;

-- ============================================================================
-- Data Cleanup Queries (Use with caution!)
-- ============================================================================

-- Delete a specific plan and all its courses (cascade will handle this automatically)
DELETE FROM public.course_plans
WHERE id = 'plan-uuid-here'
AND user_id = 'auth0|123456789';

-- Remove all courses from a plan (but keep the plan)
DELETE FROM public.plan_courses
WHERE plan_id = 'plan-uuid-here';

-- Delete all plans for a user
DELETE FROM public.course_plans
WHERE user_id = 'auth0|123456789';

-- ============================================================================
-- Useful Functions
-- ============================================================================

-- Function to get next available term order for a plan/term combination
CREATE OR REPLACE FUNCTION get_next_term_order(p_plan_id UUID, p_term TEXT, p_year INT)
RETURNS INT AS $$
  SELECT COALESCE(MAX(term_order), 0) + 1
  FROM public.plan_courses
  WHERE plan_id = p_plan_id
  AND term = p_term
  AND (year = p_year OR (year IS NULL AND p_year IS NULL));
$$ LANGUAGE SQL;

-- Usage:
-- SELECT get_next_term_order('plan-uuid', '2A', 2025);

