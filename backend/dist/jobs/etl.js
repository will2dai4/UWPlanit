"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.etlService = exports.ETLService = void 0;
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
/**
 * ETL Service for ingesting UW course data
 */
class ETLService {
    isRunning = false;
    /**
     * Check if ETL is currently running
     */
    isETLRunning() {
        return this.isRunning;
    }
    /**
     * Generate term code for UW API v3
     * Format: {century}{year}{term}
     * - Century: 0 for 1900s, 1 for 2000s, 2 for 2100s
     * - Year: Last 2 digits of year
     * - Term: 1 for Winter (Jan-Apr), 5 for Spring (May-Aug), 9 for Fall (Sep-Dec)
     *
     * Examples:
     * - Winter 2024: 1241
     * - Spring 2024: 1245
     * - Fall 2024: 1249
     */
    generateTermCode(year, term) {
        const century = Math.floor(year / 100) - 19; // 2024 -> 1, 1998 -> 0
        const yearDigits = year % 100; // 2024 -> 24
        const termDigit = term === 'winter' ? '1' : term === 'spring' ? '5' : '9';
        return `${century}${yearDigits.toString().padStart(2, '0')}${termDigit}`;
    }
    /**
     * Fetch courses from UW Open Data API (v3)
     * v3 API uses term codes, not subjects
     * Endpoint: /v3/Courses/{termCode}
     *
     * Note: UW API v3 returns ALL courses for a term in a single request
     * No pagination needed - the API returns the complete dataset
     */
    async fetchUWCourses(termCode) {
        const baseUrl = env_1.config.uwApi.baseUrl;
        const apiKey = env_1.config.uwApi.apiKey;
        if (!apiKey) {
            logger_1.logger.warn('UW API key not configured, using mock data');
            return { courses: [] };
        }
        try {
            // v3 API endpoint: /v3/Courses/{termCode}
            // Note: UW API v3 returns ALL courses for a term in one request
            const url = `${baseUrl}/Courses/${termCode}`;
            logger_1.logger.info({ url, termCode }, 'Fetching from UW API v3');
            // Fetch from API with X-API-KEY header
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-API-KEY': apiKey,
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`UW API v3 returned ${response.status}: ${response.statusText}\n${errorText}`);
            }
            const data = await response.json();
            // v3 API returns an array directly with ALL courses for the term
            let courses = [];
            if (Array.isArray(data)) {
                // Direct array response - this is the expected format
                courses = data;
            }
            else if (data.data && Array.isArray(data.data)) {
                // Some APIs wrap in a data object
                courses = data.data;
            }
            else if (data.courses && Array.isArray(data.courses)) {
                // Some APIs use a courses wrapper
                courses = data.courses;
            }
            else {
                logger_1.logger.warn({ data }, 'Unexpected response format from UW API v3');
                courses = [];
            }
            logger_1.logger.info({ termCode, totalCourses: courses.length }, 'Fetched all courses for term');
            return { courses };
        }
        catch (error) {
            logger_1.logger.error({ err: error, termCode }, 'Failed to fetch courses from UW API v3');
            throw error;
        }
    }
    /**
     * Upsert a course into the database (v3 format)
     */
    async upsertCourse(course) {
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
        // Extract units from courseComponentCode or default to 0.5
        // This is a heuristic - you may need to adjust based on actual data
        const units = 0.5; // Default, adjust as needed
        const result = await database_1.db.queryOne(query, [
            course.subjectCode,
            course.catalogNumber,
            course.title,
            units,
            course.description || course.descriptionAbbreviated,
            [course.termName], // Store term name as array
            course.associatedAcademicOrgCode || null,
            course,
        ]);
        return result.course_id;
    }
    /**
     * Parse requirements description and create relations (v3 format)
     * v3 API has requirementsDescription field that contains prereqs, coreqs, and antireqs
     */
    async parseAndCreateRelations(courseId, requirementsDescription) {
        if (!requirementsDescription) {
            return;
        }
        // Simple regex-based parser to extract course codes (e.g., "CS 246", "MATH135")
        const courseCodePattern = /([A-Z]{2,10})\s*(\d{3}[A-Z]?)/gi;
        const extractCourses = async (text, rtype) => {
            const matches = [...text.matchAll(courseCodePattern)];
            for (const match of matches) {
                const subject = match[1];
                const catalogNumber = match[2];
                // Find the target course
                const targetCourse = await database_1.db.queryOne('SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2', [subject, catalogNumber]);
                if (targetCourse) {
                    // Create the relation (avoid duplicates)
                    await database_1.db.query(`INSERT INTO course_relations (source_course_id, target_course_id, rtype)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`, [courseId, targetCourse.course_id, rtype]);
                }
            }
        };
        // Parse requirements description
        const lowerReq = requirementsDescription.toLowerCase();
        // Look for prerequisite indicators
        if (lowerReq.includes('prereq') || lowerReq.includes('prerequisite')) {
            await extractCourses(requirementsDescription, 'PREREQ');
        }
        // Look for corequisite indicators
        if (lowerReq.includes('coreq') || lowerReq.includes('corequisite')) {
            await extractCourses(requirementsDescription, 'COREQ');
        }
        // Look for antirequisite indicators
        if (lowerReq.includes('antireq') || lowerReq.includes('antirequisite')) {
            await extractCourses(requirementsDescription, 'ANTIREQ');
        }
    }
    /**
     * Run ETL process
     * @param termCodes - Optional array of term codes to fetch. If not provided, will fetch current and next term
     */
    async runETL(termCodes) {
        // Check if already running
        if (this.isRunning) {
            throw new Error('ETL is already running');
        }
        this.isRunning = true;
        let added = 0;
        let updated = 0;
        const errors = [];
        // Create ETL run record
        const runRecord = await database_1.db.queryOne('INSERT INTO etl_runs (status) VALUES ($1) RETURNING run_id', ['running']);
        const runId = runRecord.run_id;
        try {
            // If no term codes provided, generate current and next term
            let termsToProcess;
            if (termCodes && termCodes.length > 0) {
                termsToProcess = termCodes;
            }
            else {
                // Generate term codes for current term and next term
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1; // 1-12
                // Determine current term
                let currentTerm;
                if (month >= 1 && month <= 4) {
                    currentTerm = 'winter';
                }
                else if (month >= 5 && month <= 8) {
                    currentTerm = 'spring';
                }
                else {
                    currentTerm = 'fall';
                }
                // Generate current and next two terms
                termsToProcess = [];
                termsToProcess.push(this.generateTermCode(year, currentTerm));
                // Add next term
                if (currentTerm === 'winter') {
                    termsToProcess.push(this.generateTermCode(year, 'spring'));
                }
                else if (currentTerm === 'spring') {
                    termsToProcess.push(this.generateTermCode(year, 'fall'));
                }
                else {
                    termsToProcess.push(this.generateTermCode(year + 1, 'winter'));
                }
            }
            logger_1.logger.info({ runId, termCodes: termsToProcess }, 'Starting ETL process');
            for (const termCode of termsToProcess) {
                logger_1.logger.info({ termCode }, 'Processing term');
                try {
                    // Fetch courses for this term
                    const { courses } = await this.fetchUWCourses(termCode);
                    logger_1.logger.info({ termCode, courseCount: courses.length }, 'Fetched courses');
                    // Process each course
                    for (const course of courses) {
                        try {
                            // Check if course exists
                            const existing = await database_1.db.queryOne('SELECT course_id FROM courses WHERE subject = $1 AND catalog_number = $2', [course.subjectCode, course.catalogNumber]);
                            // Upsert course
                            const courseId = await this.upsertCourse(course);
                            if (existing) {
                                updated++;
                            }
                            else {
                                added++;
                            }
                            // Parse and create relations
                            await this.parseAndCreateRelations(courseId, course.requirementsDescription);
                        }
                        catch (error) {
                            const errMsg = `Failed to process course ${course.subjectCode} ${course.catalogNumber}: ${error}`;
                            logger_1.logger.error({ err: error, course }, errMsg);
                            errors.push(errMsg);
                        }
                    }
                    // Small delay to avoid hammering the API
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                catch (error) {
                    const errMsg = `Failed to fetch courses for term ${termCode}: ${error}`;
                    logger_1.logger.error({ err: error, termCode }, errMsg);
                    errors.push(errMsg);
                    // Continue to next term
                }
            }
            // Update ETL run record
            await database_1.db.query(`UPDATE etl_runs SET
          finished_at = NOW(),
          status = $1,
          added = $2,
          updated = $3,
          errors = $4
         WHERE run_id = $5`, ['completed', added, updated, JSON.stringify(errors), runId]);
            logger_1.logger.info({ runId, added, updated, errorCount: errors.length }, 'ETL process completed');
            return {
                success: true,
                added,
                updated,
                errors,
            };
        }
        catch (error) {
            logger_1.logger.error({ err: error, runId }, 'ETL process failed');
            // Update ETL run record
            await database_1.db.query(`UPDATE etl_runs SET
          finished_at = NOW(),
          status = $1,
          errors = $2
         WHERE run_id = $3`, ['failed', JSON.stringify([String(error)]), runId]);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
}
exports.ETLService = ETLService;
exports.etlService = new ETLService();
//# sourceMappingURL=etl.js.map