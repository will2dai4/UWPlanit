import { Course, CourseRelation, GraphElements } from '../types';
/**
 * Build VISX graph elements from courses and relations
 */
export declare const buildGraphElements: (courses: Course[], relations: CourseRelation[]) => GraphElements;
/**
 * Get node IDs from a course code (subject + catalog_number)
 */
export declare const getCourseNodeId: (subject: string, catalogNumber: string) => string;
//# sourceMappingURL=graph-builder.d.ts.map