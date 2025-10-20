import { Course, CourseData } from "@/types/course";
import courseData from "@/data/courses.json";

// Load course data
const courses: Course[] = (courseData as CourseData).courses;

// Get all courses
export function getAllCourses(): Course[] {
  return courses;
}

// Get course by ID
export function getCourseById(id: string): Course | undefined {
  return courses.find((course) => course.id === id);
}

// Get courses by department
export function getCoursesByDepartment(department: string): Course[] {
  return courses.filter((course) => course.department === department);
}

// Get all departments
export function getAllDepartments(): string[] {
  return Array.from(new Set(courses.map((course) => course.department))).sort();
}

// Get courses by level
export function getCoursesByLevel(level: number): Course[] {
  return courses.filter((course) => course.level === level);
}

// Search courses
export function searchCourses(query: string): Course[] {
  const searchTerm = query.toLowerCase();
  return courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm) ||
      course.name.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm)
  );
}

// Get prerequisite courses
export function getPrerequisiteCourses(course: Course): Course[] {
  return course.prerequisites
    .map((prereq) => getCourseById(prereq))
    .filter((course): course is Course => course !== undefined);
}

// Get corequisite courses
export function getCorequisiteCourses(course: Course): Course[] {
  return course.corequisites
    .map((coreq) => getCourseById(coreq))
    .filter((course): course is Course => course !== undefined);
}

// Get antirequisite courses
export function getAntirequisiteCourses(course: Course): Course[] {
  return course.antirequisites
    .map((antireq) => getCourseById(antireq))
    .filter((course): course is Course => course !== undefined);
}

// Get courses by term
export function getCoursesByTerm(term: string): Course[] {
  return courses.filter((course) => course.terms.includes(term));
}
