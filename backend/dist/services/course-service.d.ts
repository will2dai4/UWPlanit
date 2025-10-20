import { Course, CourseRelation, GraphElements } from '../types';
export declare class CourseService {
    /**
     * Search courses with filters
     */
    searchCourses(params: {
        search?: string;
        subject?: string;
        level?: number;
        term?: string;
        faculty?: string;
        limit: number;
        offset: number;
    }): Promise<{
        courses: Course[];
        total: number;
    }>;
    /**
     * Get course by ID
     */
    getCourseById(courseId: string): Promise<Course | null>;
    /**
     * Get course by subject and catalog number
     */
    getCourseByCode(subject: string, catalogNumber: string): Promise<Course | null>;
    /**
     * Get all relations for a course
     */
    getCourseRelations(courseId: string): Promise<CourseRelation[]>;
    /**
     * Get global graph (all courses and relations)
     */
    getGlobalGraph(): Promise<GraphElements>;
    /**
     * Get subject-specific graph
     */
    getSubjectGraph(subject: string): Promise<GraphElements>;
}
export declare const courseService: CourseService;
//# sourceMappingURL=course-service.d.ts.map