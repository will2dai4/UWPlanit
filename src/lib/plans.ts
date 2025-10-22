/**
 * Course Planning Utilities
 * Helper functions for working with course plans
 */

import type { PlanCourse, PlanCourseWithDetails, CoursePlanWithCourses } from "@/types/user";
import type { Course } from "@/types/course";

/**
 * Group plan courses by term and year
 */
export function groupCoursesByTerm(courses: PlanCourseWithDetails[]) {
  const grouped = new Map<string, PlanCourseWithDetails[]>();

  courses.forEach((planCourse) => {
    const key = `${planCourse.year || "Unknown"}-${planCourse.term}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(planCourse);
  });

  // Sort courses within each term by term_order
  grouped.forEach((termCourses) => {
    termCourses.sort((a, b) => (a.term_order || 0) - (b.term_order || 0));
  });

  return grouped;
}

/**
 * Get all unique terms in a plan, sorted chronologically
 */
export function getPlannedTerms(courses: PlanCourse[]) {
  const terms = new Set<string>();
  courses.forEach((c) => {
    const key = `${c.year || "Unknown"}-${c.term}`;
    terms.add(key);
  });
  return Array.from(terms).sort();
}

/**
 * Calculate total units for a plan
 */
export function calculateTotalUnits(plan: CoursePlanWithCourses): number {
  if (!plan.courses) return 0;
  
  return plan.courses.reduce((total, planCourse) => {
    const units = planCourse.course?.units || 0;
    return total + units;
  }, 0);
}

/**
 * Calculate total units for a specific term
 */
export function calculateTermUnits(courses: PlanCourseWithDetails[]): number {
  return courses.reduce((total, planCourse) => {
    const units = planCourse.course?.units || 0;
    return total + units;
  }, 0);
}

/**
 * Check if a course can be added to a plan (not already in plan)
 */
export function canAddCourseToPlan(
  plan: CoursePlanWithCourses,
  courseId: string
): boolean {
  if (!plan.courses) return true;
  return !plan.courses.some((pc) => pc.course_id === courseId);
}

/**
 * Get prerequisite violations for a course in a plan
 * Returns courses that are prerequisites but scheduled after or not in the plan
 */
export function getPrerequisiteViolations(
  planCourse: PlanCourseWithDetails,
  allPlanCourses: PlanCourseWithDetails[],
  allCourses: Course[]
): string[] {
  const course = allCourses.find((c) => c.id === planCourse.course_id);
  if (!course || !course.prerequisites || course.prerequisites.length === 0) {
    return [];
  }

  const violations: string[] = [];
  const planCourseYear = planCourse.year || 0;

  course.prerequisites.forEach((prereqId) => {
    const prereqInPlan = allPlanCourses.find((pc) => pc.course_id === prereqId);
    
    if (!prereqInPlan) {
      // Prerequisite not in plan
      violations.push(prereqId);
    } else {
      const prereqYear = prereqInPlan.year || 0;
      
      // Check if prerequisite is scheduled before this course
      // Simple check: same year and term, or later year
      if (prereqYear > planCourseYear) {
        violations.push(prereqId);
      } else if (prereqYear === planCourseYear) {
        // Same year - would need term ordering logic
        // For now, consider it a potential violation
        const termOrder = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
        const planTermIndex = termOrder.indexOf(planCourse.term);
        const prereqTermIndex = termOrder.indexOf(prereqInPlan.term);
        
        if (prereqTermIndex >= planTermIndex) {
          violations.push(prereqId);
        }
      }
    }
  });

  return violations;
}

/**
 * Get all prerequisite violations in a plan
 */
export function getAllPrerequisiteViolations(
  plan: CoursePlanWithCourses,
  allCourses: Course[]
): Map<string, string[]> {
  const violations = new Map<string, string[]>();
  
  if (!plan.courses) return violations;

  plan.courses.forEach((planCourse) => {
    const courseViolations = getPrerequisiteViolations(
      planCourse,
      plan.courses!,
      allCourses
    );
    if (courseViolations.length > 0) {
      violations.set(planCourse.course_id, courseViolations);
    }
  });

  return violations;
}

/**
 * Suggest next term based on current progress
 */
export function suggestNextTerm(plan: CoursePlanWithCourses): string {
  if (!plan.courses || plan.courses.length === 0) {
    return plan.start_term || "1A";
  }

  // Find the latest term in the plan
  const latestCourse = plan.courses.reduce((latest, current) => {
    const latestYear = latest.year || 0;
    const currentYear = current.year || 0;
    
    if (currentYear > latestYear) return current;
    if (currentYear < latestYear) return latest;
    
    // Same year, compare terms
    const termOrder = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
    const latestTermIndex = termOrder.indexOf(latest.term);
    const currentTermIndex = termOrder.indexOf(current.term);
    
    return currentTermIndex > latestTermIndex ? current : latest;
  });

  // Get next term
  const termOrder = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
  const currentIndex = termOrder.indexOf(latestCourse.term);
  
  if (currentIndex === -1 || currentIndex === termOrder.length - 1) {
    return "1A"; // Default fallback
  }
  
  return termOrder[currentIndex + 1];
}

/**
 * Get completion percentage for a plan
 */
export function getCompletionPercentage(plan: CoursePlanWithCourses): number {
  if (!plan.courses || plan.courses.length === 0) return 0;
  
  const completedCount = plan.courses.filter((c) => c.is_completed).length;
  return Math.round((completedCount / plan.courses.length) * 100);
}

/**
 * Parse term string into components
 * E.g., "2A" -> { year: 2, term: "A" }
 */
export function parseTerm(term: string): { year: number; term: string } | null {
  const match = term.match(/^(\d+)([AB])$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    term: match[2],
  };
}

/**
 * Format term for display
 * E.g., year: 2024, term: "2A" -> "2A (Fall 2024)" or "2B (Winter 2025)"
 */
export function formatTermDisplay(term: string, year?: number): string {
  const parsed = parseTerm(term);
  if (!parsed || !year) return term;
  
  // Determine season (A = Fall/Winter alternating by year level, B = Winter/Spring)
  // This is simplified - actual UW terms follow a different pattern
  const season = parsed.term === "A" ? "Fall" : "Winter";
  
  return `${term} (${season} ${year})`;
}

