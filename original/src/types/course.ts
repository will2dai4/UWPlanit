export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  units: number;
  prerequisites: string[];
  corequisites: string[];
  antirequisites: string[];
  terms: string[];
  department: string;
  level: number;
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
