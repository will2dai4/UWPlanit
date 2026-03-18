export type Course = {
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
};

export type CourseData = {
  courses: Course[];
};
