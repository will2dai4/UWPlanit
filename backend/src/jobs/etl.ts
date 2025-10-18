import { db } from '../config/database';
import { config } from '../config/env';
import { logger } from '../config/logger';

/**
 * UW Open Data API Course Response (simplified)
 */
interface UWCourse {
  subject: string;
  catalog_number: string;
  title: string;
  units: number;
  description: string;
  prerequisites?: string;
  corequisites?: string;
  antirequisites?: string;
  terms_offered?: string[];
  faculty?: string;
}

/**
 * ETL Service for ingesting UW course data
 */
export class ETLService {
  private isRunning = false;

  /**
   * Check if ETL is currently running
   */
  isETLRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Fetch courses from UW Open Data API
   */
  private async fetchUWCourses(
    subject?: string,
    cursor?: string
  ): Promise<{ courses: UWCourse[]; nextCursor?: string }> {
    const baseUrl = config.uwApi.baseUrl;
    const apiKey = config.uwApi.apiKey;

    if (!apiKey) {
      logger.warn('UW API key not configured, using mock data');
      return { courses: [] };
    }

    try {
      // Build URL
      let url = `${baseUrl}/courses`;
      const params = new URLSearchParams();
      
      if (subject) {
        params.append('subject', subject);
      }
      if (cursor) {
        params.append('cursor', cursor);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Fetch from API
      const response = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`UW API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        courses: data.data || [],
        nextCursor: data.meta?.next_cursor,
      };
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch courses from UW API');
      throw error;
    }
  }

  /**
   * Upsert a course into the database
   */
  private async upsertCourse(course: UWCourse): Promise<string> {
    const query = `
      INSERT INTO courses (subject, catalog_number, title, units, description, terms_offered, faculty, raw_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (subject, catalog_number)
      DO UPDATE SET
        title = EXCLUDED.title,
        units = EXCLUDED.units,
        description = EXCLUDED.description,
        terms_offered = EXCLUDED.terms_offered,
        faculty = EXCLUDED.faculty,
        raw_json = EXCLUDED.raw_json,
        updated_at = NOW()
      RETURNING course_id
    `;

    const result = await db.queryOne<{ course_id: string }>(query, [
      course.subject,
      course.catalog_number,
      course.title,
      course.units,
      course.description,
      course.terms_offered || [],
      course.faculty || null,
      course,
    ]);

    return result!.course_id;
  }

  /**
   * Parse prerequisite/corequisite/antirequisite text and create relations
   * This is a simplified parser - in production, you'd want more robust parsing
   */
  private async parseAndCreateRelations(
    courseId: string,
    prerequisites?: string,
    corequisites?: string,
    antirequisites?: string
  ): Promise<void> {
    // Simple regex-based parser to extract course codes (e.g., "CS 246", "MATH135")
    const courseCodePattern = /([A-Z]{2,10})\s*(\d{3}[A-Z]?)/gi;

    const extractCourses = async (text: string, rtype: 'PREREQ' | 'COREQ' | 'ANTIREQ') => {
      const matches = [...text.matchAll(courseCodePattern)];
      
      for (const match of matches) {
        const subject = match[1];
        const catalogNumber = match[2];

        // Find the target course
        const targetCourse = await db.queryOne<{ course_id: string }>(
          'SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2',
          [subject, catalogNumber]
        );

        if (targetCourse) {
          // Create the relation (avoid duplicates)
          await db.query(
            `INSERT INTO course_relations (source_course_id, target_course_id, rtype)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [courseId, targetCourse.course_id, rtype]
          );
        }
      }
    };

    if (prerequisites) {
      await extractCourses(prerequisites, 'PREREQ');
    }

    if (corequisites) {
      await extractCourses(corequisites, 'COREQ');
    }

    if (antirequisites) {
      await extractCourses(antirequisites, 'ANTIREQ');
    }
  }

  /**
   * Run ETL process
   */
  async runETL(subjects?: string[]): Promise<{
    success: boolean;
    added: number;
    updated: number;
    errors: string[];
  }> {
    // Check if already running
    if (this.isRunning) {
      throw new Error('ETL is already running');
    }

    this.isRunning = true;
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    // Create ETL run record
    const runRecord = await db.queryOne<{ run_id: number }>(
      'INSERT INTO etl_runs (status) VALUES ($1) RETURNING run_id',
      ['running']
    );

    const runId = runRecord!.run_id;

    try {
      logger.info({ runId, subjects }, 'Starting ETL process');

      // Get list of subjects to process (default to CS and MATH as per instructions)
      const subjectsToProcess = subjects || ['CS', 'MATH'];

      for (const subject of subjectsToProcess) {
        logger.info({ subject }, 'Processing subject');

        let cursor: string | undefined;
        let pageCount = 0;

        do {
          try {
            // Fetch courses for this subject
            const { courses, nextCursor } = await this.fetchUWCourses(subject, cursor);

            logger.info({ subject, pageCount, courseCount: courses.length }, 'Fetched courses');

            // Process each course
            for (const course of courses) {
              try {
                // Check if course exists
                const existing = await db.queryOne<{ course_id: string }>(
                  'SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2',
                  [course.subject, course.catalog_number]
                );

                // Upsert course
                const courseId = await this.upsertCourse(course);

                if (existing) {
                  updated++;
                } else {
                  added++;
                }

                // Parse and create relations
                await this.parseAndCreateRelations(
                  courseId,
                  course.prerequisites,
                  course.corequisites,
                  course.antirequisites
                );
              } catch (error) {
                const errMsg = `Failed to process course ${course.subject} ${course.catalog_number}: ${error}`;
                logger.error({ err: error, course }, errMsg);
                errors.push(errMsg);
              }
            }

            cursor = nextCursor;
            pageCount++;

            // Small delay to avoid hammering the API
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            const errMsg = `Failed to fetch page ${pageCount} for subject ${subject}: ${error}`;
            logger.error({ err: error, subject }, errMsg);
            errors.push(errMsg);
            break; // Move to next subject
          }
        } while (cursor);
      }

      // Update ETL run record
      await db.query(
        `UPDATE etl_runs SET
          finished_at = NOW(),
          status = $1,
          added = $2,
          updated = $3,
          errors = $4
         WHERE run_id = $5`,
        ['completed', added, updated, JSON.stringify(errors), runId]
      );

      logger.info(
        { runId, added, updated, errorCount: errors.length },
        'ETL process completed'
      );

      return {
        success: true,
        added,
        updated,
        errors,
      };
    } catch (error) {
      logger.error({ err: error, runId }, 'ETL process failed');

      // Update ETL run record
      await db.query(
        `UPDATE etl_runs SET
          finished_at = NOW(),
          status = $1,
          errors = $2
         WHERE run_id = $3`,
        ['failed', JSON.stringify([String(error)]), runId]
      );

      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}

export const etlService = new ETLService();
