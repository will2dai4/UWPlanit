#!/usr/bin/env ts-node
"use strict";
/**
 * Populate Database Script
 *
 * This script fetches course data from the UW Open Data API v3
 * and populates the database with course information.
 *
 * Usage:
 *   npm run populate            # Populate Fall 2025 (1259) and Winter 2026 (1261)
 *   npm run populate 1249       # Populate Fall 2024
 *   npm run populate 1249 1251  # Populate Fall 2024 and Winter 2025
 *
 * Term Code Format: {century}{year}{term}
 *   - Century: 1 for 2000s
 *   - Year: Last 2 digits (24 for 2024, 25 for 2025, 26 for 2026)
 *   - Term: 1=Winter, 5=Spring, 9=Fall
 *
 * Examples:
 *   1241 - Winter 2024 (Jan-Apr)
 *   1245 - Spring 2024 (May-Aug)
 *   1249 - Fall 2024 (Sep-Dec)
 *   1251 - Winter 2025 (Jan-Apr)
 *   1259 - Fall 2025 (Sep-Dec)
 *   1261 - Winter 2026 (Jan-Apr)
 *
 * Or directly with ts-node:
 *   ts-node src/scripts/populate-database.ts 1259 1261
 */
Object.defineProperty(exports, "__esModule", { value: true });
const etl_1 = require("../jobs/etl");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
async function main() {
    try {
        // Get term codes from command line arguments
        const termCodes = process.argv.slice(2);
        // Default to Fall 2025 (1259) and Winter 2026 (1261) if no arguments provided
        const termsToProcess = termCodes.length > 0 ? termCodes : ['1259', '1261'];
        if (termsToProcess) {
            // Validate term code format (4 digits)
            for (const term of termsToProcess) {
                if (!/^\d{4}$/.test(term)) {
                    console.log(`❌ Invalid term code: ${term}`);
                    console.log('   Term codes must be 4 digits (e.g., 1249 for Fall 2024)');
                    console.log('');
                    console.log('   Format: {century}{year}{term}');
                    console.log('   Examples:');
                    console.log('     1241 - Winter 2024');
                    console.log('     1245 - Spring 2024');
                    console.log('     1249 - Fall 2024');
                    console.log('     1251 - Winter 2025');
                    console.log('');
                    process.exit(1);
                }
            }
        }
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║        UWPlanit Database Population Script          ║');
        console.log('║               UW Open Data API v3                    ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('');
        if (!env_1.config.uwApi.apiKey) {
            console.log('❌ Error: UW_API_KEY not configured!');
            console.log('');
            console.log('   To fix this:');
            console.log('   1. Create backend/.env file (copy from env.example)');
            console.log('   2. Get API key from: https://uwaterloo.ca/api/');
            console.log('   3. Add to .env: UW_API_KEY=your-key-here');
            console.log('');
            console.log('   For help, see: SETUP_UW_API_V3.md');
            console.log('');
            process.exit(1);
        }
        console.log('📊 Configuration:');
        console.log(`   Environment: ${env_1.config.env}`);
        console.log(`   Database: ${env_1.config.database.url.split('@')[1]}`);
        console.log(`   API Base: ${env_1.config.uwApi.baseUrl}`);
        console.log(`   Term Codes: ${termsToProcess.join(', ')}`);
        console.log('');
        console.log('🚀 Starting ETL process...');
        console.log('   Fetching courses by term from UW API v3...');
        console.log('   This may take several minutes depending on the number of courses.');
        console.log('');
        const startTime = Date.now();
        // Run ETL with term codes
        const result = await etl_1.etlService.runETL(termsToProcess);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('');
        console.log('✅ ETL Process Completed!');
        console.log('');
        console.log('📈 Results:');
        console.log(`   ✓ Courses Added: ${result.added}`);
        console.log(`   ✓ Courses Updated: ${result.updated}`);
        console.log(`   ✓ Duration: ${duration}s`);
        if (result.errors.length > 0) {
            console.log(`   ⚠️  Errors: ${result.errors.length}`);
            console.log('');
            console.log('❌ Errors encountered:');
            result.errors.forEach((err, idx) => {
                console.log(`   ${idx + 1}. ${err}`);
            });
        }
        console.log('');
        console.log('🎉 Database population complete!');
        console.log('   You can now start using the application.');
        console.log('');
        process.exit(0);
    }
    catch (error) {
        console.error('');
        console.error('❌ Fatal Error:');
        console.error('   ', error instanceof Error ? error.message : String(error));
        console.error('');
        if (error instanceof Error && error.stack) {
            logger_1.logger.error({ err: error, stack: error.stack }, 'Database population failed');
        }
        process.exit(1);
    }
}
// Run the script
main();
//# sourceMappingURL=populate-database.js.map