#!/usr/bin/env ts-node
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
export {};
//# sourceMappingURL=populate-database.d.ts.map