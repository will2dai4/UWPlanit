import { Course } from "@/types/course";
import { supabaseAdmin } from "./supabase";

// Get all courses from database
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .order("code");

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data || [];
}

// Get course by ID
export async function getCourseById(id: string): Promise<Course | undefined> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching course:", error);
    return undefined;
  }

  return data;
}

// Get courses by department
export async function getCoursesByDepartment(department: string): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("department", department)
    .order("code");

  if (error) {
    console.error("Error fetching courses by department:", error);
    return [];
  }

  return data || [];
}

// Get all departments
export async function getAllDepartments(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("department")
    .not("department", "is", null);

  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }

  const departments = Array.from(new Set(data?.map(course => course.department))).sort();
  return departments;
}

// Get courses by level
export async function getCoursesByLevel(level: number): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("level", level)
    .order("code");

  if (error) {
    console.error("Error fetching courses by level:", error);
    return [];
  }

  return data || [];
}

// Search courses
export async function searchCourses(query: string): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .or(`code.ilike.%${query}%,name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("code");

  if (error) {
    console.error("Error searching courses:", error);
    return [];
  }

  return data || [];
}

// Get prerequisite courses
export async function getPrerequisiteCourses(course: Course): Promise<Course[]> {
  if (!course.prerequisites || course.prerequisites.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .in("id", course.prerequisites);

  if (error) {
    console.error("Error fetching prerequisite courses:", error);
    return [];
  }

  return data || [];
}

// Get corequisite courses
export async function getCorequisiteCourses(course: Course): Promise<Course[]> {
  if (!course.corequisites || course.corequisites.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .in("id", course.corequisites);

  if (error) {
    console.error("Error fetching corequisite courses:", error);
    return [];
  }

  return data || [];
}

// Get antirequisite courses
export async function getAntirequisiteCourses(course: Course): Promise<Course[]> {
  if (!course.antirequisites || course.antirequisites.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .in("id", course.antirequisites);

  if (error) {
    console.error("Error fetching antirequisite courses:", error);
    return [];
  }

  return data || [];
}

// Get courses by term
export async function getCoursesByTerm(term: string): Promise<Course[]> {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .contains("terms", [term])
    .order("code");

  if (error) {
    console.error("Error fetching courses by term:", error);
    return [];
  }

  return data || [];
}
