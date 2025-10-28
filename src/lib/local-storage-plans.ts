/**
 * Local Storage Plan Management
 * Utility functions for managing course plans in browser local storage
 * Used for unauthenticated users
 */

import type { Course } from "@/types/course";

export interface LocalPlanCourse {
  course_id: string;
  course: Course;
  term: string;
  year?: number;
  term_order?: number;
  notes?: string;
  position_x?: number | null;
  position_y?: number | null;
  is_completed?: boolean;
  grade?: string;
  added_at: string;
}

export interface LocalPlan {
  id: string;
  name: string;
  description?: string;
  start_term?: string;
  start_year?: number;
  is_active: boolean;
  courses: LocalPlanCourse[];
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = "uwplanit_course_plans";
const ACTIVE_PLAN_KEY = "uwplanit_active_plan_id";

/**
 * Get all plans from local storage
 */
export function getLocalPlans(): LocalPlan[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load plans from local storage:", error);
    return [];
  }
}

/**
 * Save plans to local storage
 */
function saveLocalPlans(plans: LocalPlan[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error("Failed to save plans to local storage:", error);
  }
}

/**
 * Get active plan from local storage
 */
export function getActivePlan(): LocalPlan | null {
  const plans = getLocalPlans();
  const activePlanId = localStorage.getItem(ACTIVE_PLAN_KEY);
  
  if (activePlanId) {
    const plan = plans.find((p) => p.id === activePlanId);
    if (plan) return plan;
  }
  
  // If no active plan found, return the first one or create a default
  if (plans.length > 0) {
    return plans[0];
  }
  
  return null;
}

/**
 * Create a new plan in local storage
 */
export function createLocalPlan(
  name: string,
  description?: string,
  startTerm?: string,
  startYear?: number,
  isActive: boolean = true
): LocalPlan {
  const plans = getLocalPlans();
  
  // If setting as active, deactivate other plans
  if (isActive) {
    plans.forEach((p) => (p.is_active = false));
  }
  
  const newPlan: LocalPlan = {
    id: crypto.randomUUID(),
    name,
    description,
    start_term: startTerm,
    start_year: startYear,
    is_active: isActive,
    courses: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  plans.push(newPlan);
  saveLocalPlans(plans);
  
  if (isActive) {
    localStorage.setItem(ACTIVE_PLAN_KEY, newPlan.id);
  }
  
  return newPlan;
}

/**
 * Update a plan in local storage
 */
export function updateLocalPlan(
  planId: string,
  updates: Partial<Omit<LocalPlan, "id" | "created_at">>
): LocalPlan | null {
  const plans = getLocalPlans();
  const index = plans.findIndex((p) => p.id === planId);
  
  if (index === -1) return null;
  
  // If setting as active, deactivate other plans
  if (updates.is_active) {
    plans.forEach((p, i) => {
      if (i !== index) p.is_active = false;
    });
    localStorage.setItem(ACTIVE_PLAN_KEY, planId);
  }
  
  plans[index] = {
    ...plans[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  saveLocalPlans(plans);
  return plans[index];
}

/**
 * Delete a plan from local storage
 */
export function deleteLocalPlan(planId: string): boolean {
  const plans = getLocalPlans();
  const filtered = plans.filter((p) => p.id !== planId);
  
  if (filtered.length === plans.length) return false;
  
  saveLocalPlans(filtered);
  
  // If deleted plan was active, clear active plan
  const activePlanId = localStorage.getItem(ACTIVE_PLAN_KEY);
  if (activePlanId === planId) {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
  }
  
  return true;
}

/**
 * Add a course to a plan in local storage
 */
export function addCourseToLocalPlan(
  planId: string,
  course: Course,
  term: string = "Unscheduled",
  year?: number,
  termOrder?: number,
  notes?: string,
  positionX?: number,
  positionY?: number
): LocalPlanCourse | null {
  const plans = getLocalPlans();
  const plan = plans.find((p) => p.id === planId);
  
  if (!plan) return null;
  
  // Check if course already exists in plan
  if (plan.courses.some((c) => c.course_id === course.id)) {
    return null;
  }
  
  const newPlanCourse: LocalPlanCourse = {
    course_id: course.id,
    course,
    term,
    year,
    term_order: termOrder,
    notes,
    position_x: positionX ?? null,
    position_y: positionY ?? null,
    is_completed: false,
    added_at: new Date().toISOString(),
  };
  
  plan.courses.push(newPlanCourse);
  plan.updated_at = new Date().toISOString();
  
  saveLocalPlans(plans);
  return newPlanCourse;
}

/**
 * Remove a course from a plan in local storage
 */
export function removeCourseFromLocalPlan(
  planId: string,
  courseId: string
): boolean {
  const plans = getLocalPlans();
  const plan = plans.find((p) => p.id === planId);
  
  if (!plan) return false;
  
  const initialLength = plan.courses.length;
  plan.courses = plan.courses.filter((c) => c.course_id !== courseId);
  
  if (plan.courses.length === initialLength) return false;
  
  plan.updated_at = new Date().toISOString();
  saveLocalPlans(plans);
  return true;
}

/**
 * Update a course in a plan in local storage
 */
export function updateCourseInLocalPlan(
  planId: string,
  courseId: string,
  updates: Partial<Omit<LocalPlanCourse, "course_id" | "course" | "added_at">>
): LocalPlanCourse | null {
  const plans = getLocalPlans();
  const plan = plans.find((p) => p.id === planId);
  
  if (!plan) return null;
  
  const courseIndex = plan.courses.findIndex((c) => c.course_id === courseId);
  if (courseIndex === -1) return null;
  
  plan.courses[courseIndex] = {
    ...plan.courses[courseIndex],
    ...updates,
  };
  
  plan.updated_at = new Date().toISOString();
  saveLocalPlans(plans);
  
  return plan.courses[courseIndex];
}

/**
 * Bulk update course positions in a plan
 */
export function updateLocalPlanPositions(
  planId: string,
  positions: Array<{ course_id: string; position_x: number; position_y: number }>
): boolean {
  const plans = getLocalPlans();
  const plan = plans.find((p) => p.id === planId);
  
  if (!plan) return false;
  
  positions.forEach(({ course_id, position_x, position_y }) => {
    const course = plan.courses.find((c) => c.course_id === course_id);
    if (course) {
      course.position_x = position_x;
      course.position_y = position_y;
    }
  });
  
  plan.updated_at = new Date().toISOString();
  saveLocalPlans(plans);
  return true;
}

/**
 * Clear all plans from local storage (useful for testing or reset)
 */
export function clearAllLocalPlans(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_PLAN_KEY);
}

/**
 * Export plans as JSON (for backup or migration)
 */
export function exportPlansAsJSON(): string {
  const plans = getLocalPlans();
  return JSON.stringify(plans, null, 2);
}

/**
 * Import plans from JSON (for restore or migration)
 */
export function importPlansFromJSON(json: string): boolean {
  try {
    const plans = JSON.parse(json) as LocalPlan[];
    
    // Validate structure
    if (!Array.isArray(plans)) {
      throw new Error("Invalid plans data");
    }
    
    saveLocalPlans(plans);
    return true;
  } catch (error) {
    console.error("Failed to import plans:", error);
    return false;
  }
}

