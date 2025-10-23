export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  units: number | null;
  prerequisites: string[] | null;
  corequisites: string[] | null;
  antirequisites: string[] | null;
  terms: string[] | null;
  department: string;
  level: number | null;
  created_at: string | null;
}

export interface CourseData {
  courses: Course[];
}

export interface CourseNode {
  id: string;
  code: string;
  name: string;
  x: number;
  y: number;
  level: number;
  department: string;
}

export interface CourseEdge {
  id: string;
  source: string;
  target: string;
  type: "prerequisite" | "corequisite" | "antirequisite";
}

export interface CourseGraph {
  nodes: CourseNode[];
  edges: CourseEdge[];
}

export interface CourseFilter {
  department?: string;
  level?: number;
  term?: string;
  search?: string;
}
