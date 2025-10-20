"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const etl_1 = require("../jobs/etl");
const logger_1 = require("../config/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * ETL trigger request schema
 */
const etlRequestSchema = zod_1.z.object({
    subjects: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * POST /admin/etl/run
 * Trigger ETL process to fetch and populate courses from UW API
 *
 * @param {string[]} subjects - Optional array of subject codes (e.g., ['CS', 'MATH'])
 * @returns {object} ETL run results
 */
router.post('/etl/run', async (req, res) => {
    try {
        // Validate request body
        const body = etlRequestSchema.parse(req.body);
        // Check if ETL is already running
        if (etl_1.etlService.isETLRunning()) {
            res.status(409).json({
                error: 'ETL is already running',
                message: 'Please wait for the current ETL process to complete',
            });
            return;
        }
        logger_1.logger.info({ subjects: body.subjects }, 'ETL triggered via API');
        // Start ETL in background (don't await)
        etl_1.etlService.runETL(body.subjects)
            .then((result) => {
            logger_1.logger.info(result, 'ETL completed successfully');
        })
            .catch((error) => {
            logger_1.logger.error({ err: error }, 'ETL failed');
        });
        res.status(202).json({
            message: 'ETL process started',
            subjects: body.subjects || ['CS', 'MATH'],
            status: 'processing',
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Invalid request',
                details: error.errors,
            });
            return;
        }
        logger_1.logger.error({ err: error }, 'Failed to start ETL');
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
router.get('/etl/status', async (_req, res) => {
    try {
        const isRunning = etl_1.etlService.isETLRunning();
        res.json({
            isRunning,
            status: isRunning ? 'processing' : 'idle',
        });
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Failed to get ETL status');
        res.status(500).json({
            error: 'Failed to get ETL status',
            message: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map