import { Router, Request, Response } from 'express';
import { etlService } from '../jobs/etl';
import { logger } from '../config/logger';
import { z } from 'zod';

const router = Router();

/**
 * ETL trigger request schema
 */
const etlRequestSchema = z.object({
  subjects: z.array(z.string()).optional(),
});

/**
 * POST /admin/etl/run
 * Trigger ETL process to fetch and populate courses from UW API
 * 
 * @param {string[]} subjects - Optional array of subject codes (e.g., ['CS', 'MATH'])
 * @returns {object} ETL run results
 */
router.post('/etl/run', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const body = etlRequestSchema.parse(req.body);

    // Check if ETL is already running
    if (etlService.isETLRunning()) {
      res.status(409).json({
        error: 'ETL is already running',
        message: 'Please wait for the current ETL process to complete',
      });
      return;
    }

    logger.info({ subjects: body.subjects }, 'ETL triggered via API');

    // Start ETL in background (don't await)
    etlService.runETL(body.subjects)
      .then((result) => {
        logger.info(result, 'ETL completed successfully');
      })
      .catch((error) => {
        logger.error({ err: error }, 'ETL failed');
      });

    res.status(202).json({
      message: 'ETL process started',
      subjects: body.subjects || ['CS', 'MATH'],
      status: 'processing',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
      return;
    }

    logger.error({ err: error }, 'Failed to start ETL');
    res.status(500).json({
      error: 'Failed to start ETL process',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /admin/etl/status
 * Check ETL process status
 * 
 * @returns {object} ETL status
 */
router.get('/etl/status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isRunning = etlService.isETLRunning();

    res.json({
      isRunning,
      status: isRunning ? 'processing' : 'idle',
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to get ETL status');
    res.status(500).json({
      error: 'Failed to get ETL status',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

