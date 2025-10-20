"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseService = exports.CourseService = void 0;
const database_1 = require("../config/database");
const graph_builder_1 = require("../utils/graph-builder");
const logger_1 = require("../config/logger");
class CourseService {
    /**
     * Search courses with filters
     */
    async searchCourses(params) {
        const { search, subject, level, term, faculty, limit, offset } = params;
        // Build WHERE clauses
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (subject) {
            conditions.push(`subject = $${paramIndex++}`);
            values.push(subject.toUpperCase());
        }
        if (level) {
            conditions.push(`level = $${paramIndex++}`);
            values.push(level);
        }
        if (faculty) {
            conditions.push(`faculty ILIKE $${paramIndex++}`);
            values.push(`%${faculty}%`);
        }
        if (term) {
            conditions.push(`$${paramIndex++} = ANY(terms_offered)`);
            values.push(term);
        }
        if (search) {
            conditions.push(`(subject ILIKE $${paramIndex} OR catalog_number ILIKE $${paramIndex} OR title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
            values.push(`%${search}%`);
            paramIndex++;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Get total count
        const countQuery = `SELECT COUNT(*) as count FROM courses ${whereClause}`;
        const countResult = await database_1.db.queryOne(countQuery, values);
        const total = parseInt(countResult?.count || '0', 10);
        // Get courses
        values.push(limit, offset);
        const coursesQuery = `
      SELECT * FROM courses
      ${whereClause}
      ORDER BY subject, catalog_number
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        const courses = await database_1.db.query(coursesQuery, values);
        return { courses, total };
    }
    /**
     * Get course by ID
     */
    async getCourseById(courseId) {
        const query = 'SELECT * FROM courses WHERE course_id = $1';
        return database_1.db.queryOne(query, [courseId]);
    }
    /**
     * Get course by subject and catalog number
     */
    async getCourseByCode(subject, catalogNumber) {
        const query = 'SELECT * FROM courses WHERE subject = $1 AND catalog_number = $2';
        return database_1.db.queryOne(query, [subject.toUpperCase(), catalogNumber]);
    }
    /**
     * Get all relations for a course
     */
    async getCourseRelations(courseId) {
        const query = `
      SELECT * FROM course_relations
      WHERE source_course_id = $1 OR target_course_id = $1
    `;
        return database_1.db.query(query, [courseId]);
    }
    /**
     * Get global graph (all courses and relations)
     */
    async getGlobalGraph() {
        logger_1.logger.info('Building global graph from database');
        // Get all courses
        const courses = await database_1.db.query('SELECT * FROM courses ORDER BY subject, catalog_number');
        // Get all relations
        const relations = await database_1.db.query('SELECT * FROM course_relations');
        // Build graph
        const elements = (0, graph_builder_1.buildGraphElements)(courses, relations);
        return elements;
    }
    /**
     * Get subject-specific graph
     */
    async getSubjectGraph(subject) {
        const upperSubject = subject.toUpperCase();
        logger_1.logger.info({ subject: upperSubject }, 'Building subject graph from database');
        // Get courses for this subject
        const courses = await database_1.db.query('SELECT * FROM courses WHERE subject = $1 ORDER BY catalog_number', [upperSubject]);
        if (courses.length === 0) {
            return { nodes: [], edges: [] };
        }
        const courseIds = courses.map(c => c.course_id);
        // Get relations involving these courses
        const relations = await database_1.db.query(`SELECT * FROM course_relations
       WHERE source_course_id = ANY($1) OR target_course_id = ANY($1)`, [courseIds]);
        // Build graph
        const elements = (0, graph_builder_1.buildGraphElements)(courses, relations);
        return elements;
    }
}
exports.CourseService = CourseService;
exports.courseService = new CourseService();
//# sourceMappingURL=course-service.js.map