"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
/**
 * Run database migrations
 */
async function migrate() {
    try {
        logger_1.logger.info('Starting database migration');
        // Read schema file
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf-8');
        // Execute schema
        await database_1.db.query(schema);
        logger_1.logger.info('Database migration completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Database migration failed');
        process.exit(1);
    }
}
migrate();
//# sourceMappingURL=migrate.js.map