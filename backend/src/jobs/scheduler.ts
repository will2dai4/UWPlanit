import cron from 'node-cron';
import { etlService } from './etl';
import { logger } from '../config/logger';

/**
 * Schedule ETL jobs
 */
export const scheduleJobs = () => {
  // Run ETL weekly on Sundays at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Starting scheduled weekly ETL');
    
    try {
      const result = await etlService.runETL();
      logger.info({ result }, 'Scheduled ETL completed');
    } catch (error) {
      logger.error({ err: error }, 'Scheduled ETL failed');
    }
  });

  logger.info('ETL jobs scheduled');
};

