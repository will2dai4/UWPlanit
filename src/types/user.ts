/**
 * User and Course Planning Types
 */

export interface User {
  id: string; // Auth0 user ID
  email: string;
  name: string | null;
  program: string | null;
  current_term: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CoursePlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
  start_term: string | null;
  start_year: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlanCourse {
  id: string;
  plan_id: string;
  course_id: string;
  term: string;
  year: number | null;
  term_order: number | null;
  notes: string | null;
  is_completed: boolean | null;
  grade: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Extended types with joined data
 */
export interface CoursePlanWithCourses extends CoursePlan {
  courses?: PlanCourseWithDetails[];
}

export interface PlanCourseWithDetails extends PlanCourse {
  course?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    units: number | null;
    department: string;
    level: number | null;
  };
}

/**
 * Input types for creating/updating
 */
export interface CreateCoursePlanInput {
  name: string;
  description?: string;
  start_term?: string;
  start_year?: number;
  is_active?: boolean;
}

export interface UpdateCoursePlanInput {
  id: string;
  name?: string;
  description?: string;
  start_term?: string;
  start_year?: number;
  is_active?: boolean;
}

export interface AddCourseToPlanInput {
  plan_id: string;
  course_id: string;
  term: string;
  year?: number;
  term_order?: number;
  notes?: string;
}

export interface UpdatePlanCourseInput {
  id: string;
  term?: string;
  year?: number;
  term_order?: number;
  notes?: string;
  is_completed?: boolean;
  grade?: string;
}

export interface CreateUserInput {
  id: string; // Auth0 user ID
  email: string;
  name?: string;
  program?: string;
  current_term?: string;
  avatar_url?: string;
}

export interface UpdateUserInput {
  name?: string;
  program?: string;
  current_term?: string;
  avatar_url?: string;
}

