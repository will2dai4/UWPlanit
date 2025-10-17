import { db } from '../config/database';
import { redis } from '../config/redis';
import { Course, CourseRelation, CytoscapeElements } from '../types';
import { buildGraphElements } from '../utils/graph-builder';
import { cacheKeys, cacheTTL } from '../utils/cache-keys';
import { logger } from '../config/logger';

export class CourseService {
  /**
   * Search courses with filters
   */
  async searchCourses(params: {
    search?: string;
    subject?: string;
    level?: number;
    term?: string;
    faculty?: string;
    limit: number;
    offset: number;
  }): Promise<{ courses: Course[]; total: number }> {
    const { search, subject, level, term, faculty, limit, offset } = params;

    // Build WHERE clauses
    const conditions: string[] = [];
    const values: unknown[] = [];
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
      conditions.push(
        `(subject ILIKE $${paramIndex} OR catalog_number ILIKE $${paramIndex} OR title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM courses ${whereClause}`;
    const countResult = await db.queryOne<{ count: string }>(countQuery, values);
    const total = parseInt(countResult?.count || '0', 10);

    // Get courses
    values.push(limit, offset);
    const coursesQuery = `
      SELECT * FROM courses
      ${whereClause}
      ORDER BY subject, catalog_number
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const courses = await db.query<Course>(coursesQuery, values);

    return { courses, total };
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    const query = 'SELECT * FROM courses WHERE course_id = $1';
    return db.queryOne<Course>(query, [courseId]);
  }

  /**
   * Get course by subject and catalog number
   */
  async getCourseByCode(subject: string, catalogNumber: string): Promise<Course | null> {
    // Check cache first
    const cacheKey = cacheKeys.course(subject, catalogNumber);
    const cached = await redis.get<Course>(cacheKey);
    if (cached) {
      logger.debug({ cacheKey }, 'Course cache hit');
      return cached;
    }

    const query = 'SELECT * FROM courses WHERE subject = $1 AND catalog_number = $2';
    const course = await db.queryOne<Course>(query, [subject.toUpperCase(), catalogNumber]);

    if (course) {
      await redis.set(cacheKey, course, cacheTTL.course);
    }

    return course;
  }

  /**
   * Get all relations for a course
   */
  async getCourseRelations(courseId: string): Promise<CourseRelation[]> {
    const query = `
      SELECT * FROM course_relations
      WHERE source_course_id = $1 OR target_course_id = $1
    `;
    return db.query<CourseRelation>(query, [courseId]);
  }

  /**
   * Get global graph (all courses and relations)
   */
  async getGlobalGraph(): Promise<CytoscapeElements> {
    // Check cache first
    const cacheKey = cacheKeys.graphGlobal();
    const cached = await redis.get<CytoscapeElements>(cacheKey);
    if (cached) {
      logger.info('Global graph cache hit');
      return cached;
    }

    logger.info('Building global graph from database');

    // Get all courses
    const courses = await db.query<Course>('SELECT * FROM courses ORDER BY subject, catalog_number');

    // Get all relations
    const relations = await db.query<CourseRelation>('SELECT * FROM course_relations');

    // Build graph
    const elements = buildGraphElements(courses, relations);

    // Cache the result
    await redis.set(cacheKey, elements, cacheTTL.graph);

    return elements;
  }

  /**
   * Get subject-specific graph
   */
  async getSubjectGraph(subject: string): Promise<CytoscapeElements> {
    const upperSubject = subject.toUpperCase();

    // Check cache first
    const cacheKey = cacheKeys.graphSubject(upperSubject);
    const cached = await redis.get<CytoscapeElements>(cacheKey);
    if (cached) {
      logger.info({ subject: upperSubject }, 'Subject graph cache hit');
      return cached;
    }

    logger.info({ subject: upperSubject }, 'Building subject graph from database');

    // Get courses for this subject
    const courses = await db.query<Course>(
      'SELECT * FROM courses WHERE subject = $1 ORDER BY catalog_number',
      [upperSubject]
    );

    if (courses.length === 0) {
      return { nodes: [], edges: [] };
    }

    const courseIds = courses.map(c => c.course_id);

    // Get relations involving these courses
    const relations = await db.query<CourseRelation>(
      `SELECT * FROM course_relations
       WHERE source_course_id = ANY($1) OR target_course_id = ANY($1)`,
      [courseIds]
    );

    // Build graph
    const elements = buildGraphElements(courses, relations);

    // Cache the result
    await redis.set(cacheKey, elements, cacheTTL.graph);

    return elements;
  }

  /**
   * Invalidate all graph caches
   */
  async invalidateGraphCaches(): Promise<void> {
    await redis.delPattern(cacheKeys.allGraphs());
    await redis.delPattern(cacheKeys.allSearches());
    logger.info('Graph caches invalidated');
  }
}

export const courseService = new CourseService();

