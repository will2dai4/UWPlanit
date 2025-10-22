// This file is deprecated - use tRPC queries instead
// All course data is now fetched from the database via tRPC

import { Course } from "@/types/course";

// Legacy functions for backward compatibility
// These should be replaced with tRPC queries in components

export function getAllCourses(): Course[] {
  console.warn("getAllCourses is deprecated. Use trpc.course.getAll.useQuery() instead");
  return [];
}

export function getCourseById(_id: string): Course | undefined {
  console.warn("getCourseById is deprecated. Use trpc.course.getById.useQuery({ id }) instead");
  return undefined;
}

export function getCoursesByDepartment(_department: string): Course[] {
  console.warn("getCoursesByDepartment is deprecated. Use trpc.course.getByDepartment.useQuery({ department }) instead");
  return [];
}

export function getAllDepartments(): string[] {
  console.warn("getAllDepartments is deprecated. Use trpc.course.getAllDepartments.useQuery() instead");
  return [];
}

export function getCoursesByLevel(_level: number): Course[] {
  console.warn("getCoursesByLevel is deprecated. Use trpc.course.getByLevel.useQuery({ level }) instead");
  return [];
}

export function searchCourses(_query: string): Course[] {
  console.warn("searchCourses is deprecated. Use trpc.course.search.useQuery({ query }) instead");
  return [];
}

export function getPrerequisiteCourses(_course: Course): Course[] {
  console.warn("getPrerequisiteCourses is deprecated. Use trpc.course.getPrerequisites.useQuery({ id: course.id }) instead");
  return [];
}

export function getCorequisiteCourses(_course: Course): Course[] {
  console.warn("getCorequisiteCourses is deprecated. Use trpc.course.getCorequisites.useQuery({ id: course.id }) instead");
  return [];
}

export function getAntirequisiteCourses(_course: Course): Course[] {
  console.warn("getAntirequisiteCourses is deprecated. Use trpc.course.getAntirequisites.useQuery({ id: course.id }) instead");
  return [];
}

export function getCoursesByTerm(_term: string): Course[] {
  console.warn("getCoursesByTerm is deprecated. Use trpc.course.getByTerm.useQuery({ term }) instead");
  return [];
}
