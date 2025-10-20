"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
const logger_1 = require("./logger");
/**
 * PostgreSQL connection pool
 */
class Database {
    static instance;
    pool;
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: env_1.config.database.url,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        this.pool.on('error', (err) => {
            logger_1.logger.error({ err }, 'Unexpected database pool error');
        });
        this.pool.on('connect', () => {
            logger_1.logger.debug('New database connection established');
        });
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    /**
     * Get a client from the pool
     */
    async getClient() {
        return this.pool.connect();
    }
    /**
     * Execute a query
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            logger_1.logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error({ err: error, text }, 'Query error');
            throw error;
        }
    }
    /**
     * Execute a query and return a single row
     */
    async queryOne(text, params) {
        const rows = await this.query(text, params);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Close the pool
     */
    async close() {
        await this.pool.end();
        logger_1.logger.info('Database pool closed');
    }
    /**
     * Test database connection
     */
    async testConnection() {
        try {
            await this.query('SELECT NOW()');
            logger_1.logger.info('Database connection successful');
            return true;
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Database connection failed');
            return false;
        }
    }
}
exports.Database = Database;
exports.db = Database.getInstance();
//# sourceMappingURL=database.js.map