import { Pool, PoolClient } from 'pg';
import { config } from './env';
import { logger } from './logger';

/**
 * PostgreSQL connection pool
 */
export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected database pool error');
    });

    this.pool.on('connect', () => {
      logger.debug('New database connection established');
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  /**
   * Get a client from the pool
   */
  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Execute a query
   */
  public async query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug({ text, duration, rows: result.rowCount }, 'Executed query');
      return result.rows as T[];
    } catch (error) {
      logger.error({ err: error, text }, 'Query error');
      throw error;
    }
  }

  /**
   * Execute a query and return a single row
   */
  public async queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Close the pool
   */
  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT NOW()');
      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error({ err: error }, 'Database connection failed');
      return false;
    }
  }
}

export const db = Database.getInstance();

