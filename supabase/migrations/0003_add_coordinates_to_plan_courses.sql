-- -----------------------------------------------------------------------------
-- 0003_add_coordinates_to_plan_courses.sql — Add coordinate fields for visual graph positions
-- -----------------------------------------------------------------------------

-- Add position_x and position_y columns to store node coordinates in the graph
ALTER TABLE public.plan_courses
ADD COLUMN IF NOT EXISTS position_x DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS position_y DOUBLE PRECISION;

-- Create index for spatial queries (optional, for future optimization)
CREATE INDEX IF NOT EXISTS idx_plan_courses_positions 
ON public.plan_courses(plan_id, position_x, position_y) 
WHERE position_x IS NOT NULL AND position_y IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.plan_courses.position_x IS 'X coordinate of course node in visual graph (nullable)';
COMMENT ON COLUMN public.plan_courses.position_y IS 'Y coordinate of course node in visual graph (nullable)';

