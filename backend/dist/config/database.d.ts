import { PoolClient } from 'pg';
/**
 * PostgreSQL connection pool
 */
export declare class Database {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): Database;
    /**
     * Get a client from the pool
     */
    getClient(): Promise<PoolClient>;
    /**
     * Execute a query
     */
    query<T = unknown>(text: string, params?: unknown[]): Promise<T[]>;
    /**
     * Execute a query and return a single row
     */
    queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null>;
    /**
     * Close the pool
     */
    close(): Promise<void>;
    /**
     * Test database connection
     */
    testConnection(): Promise<boolean>;
}
export declare const db: Database;
//# sourceMappingURL=database.d.ts.map