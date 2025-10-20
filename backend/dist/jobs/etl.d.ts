/**
 * ETL Service for ingesting UW course data
 */
export declare class ETLService {
    private isRunning;
    /**
     * Check if ETL is currently running
     */
    isETLRunning(): boolean;
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
    private generateTermCode;
    /**
     * Fetch courses from UW Open Data API (v3)
     * v3 API uses term codes, not subjects
     * Endpoint: /v3/Courses/{termCode}
     *
     * Note: UW API v3 returns ALL courses for a term in a single request
     * No pagination needed - the API returns the complete dataset
     */
    private fetchUWCourses;
    /**
     * Upsert a course into the database (v3 format)
     */
    private upsertCourse;
    /**
     * Parse requirements description and create relations (v3 format)
     * v3 API has requirementsDescription field that contains prereqs, coreqs, and antireqs
     */
    private parseAndCreateRelations;
    /**
     * Run ETL process
     * @param termCodes - Optional array of term codes to fetch. If not provided, will fetch current and next term
     */
    runETL(termCodes?: string[]): Promise<{
        success: boolean;
        added: number;
        updated: number;
        errors: string[];
    }>;
}
export declare const etlService: ETLService;
//# sourceMappingURL=etl.d.ts.map