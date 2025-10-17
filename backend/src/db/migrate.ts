import fs from 'fs';
import path from 'path';
import { db } from '../config/database';
import { logger } from '../config/logger';

/**
 * Run database migrations
 */
async function migrate() {
  try {
    logger.info('Starting database migration');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    await db.query(schema);

    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Database migration failed');
    process.exit(1);
  }
}

migrate();

