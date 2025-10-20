"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const etl_1 = require("./etl");
const logger_1 = require("../config/logger");
/**
 * Schedule ETL jobs
 */
const scheduleJobs = () => {
    // Run ETL weekly on Sundays at 2 AM
    node_cron_1.default.schedule('0 2 * * 0', async () => {
        logger_1.logger.info('Starting scheduled weekly ETL');
        try {
            const result = await etl_1.etlService.runETL();
            logger_1.logger.info({ result }, 'Scheduled ETL completed');
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Scheduled ETL failed');
        }
    });
    logger_1.logger.info('ETL jobs scheduled');
};
exports.scheduleJobs = scheduleJobs;
//# sourceMappingURL=scheduler.js.map