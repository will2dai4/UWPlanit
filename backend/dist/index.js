"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const database_1 = require("./config/database");
const request_id_1 = require("./middleware/request-id");
const rate_limit_1 = require("./middleware/rate-limit");
const error_handler_1 = require("./middleware/error-handler");
const routes_1 = __importDefault(require("./routes"));
const scheduler_1 = require("./jobs/scheduler");
/**
 * Create and configure Express application
 */
const createApp = () => {
    const app = (0, express_1.default)();
    // Security middleware
    app.use((0, helmet_1.default)());
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: env_1.config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['X-Request-ID'],
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request ID middleware
    app.use(request_id_1.requestId);
    // Request logging
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        customLogLevel: (_req, res, err) => {
            if (res.statusCode >= 500 || err)
                return 'error';
            if (res.statusCode >= 400)
                return 'warn';
            return 'info';
        },
        customSuccessMessage: (req, res) => {
            return `${req.method} ${req.url} ${res.statusCode}`;
        },
        customErrorMessage: (req, res, err) => {
            return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
        },
    }));
    // Rate limiting
    app.use(rate_limit_1.generalRateLimiter);
    // API routes
    app.use('/api/v1', routes_1.default);
    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            name: 'UWPlanit API',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                health: '/api/v1/health',
                courses: '/api/v1/courses',
                graph: '/api/v1/graph',
                plans: '/api/v1/plans',
            },
        });
    });
    // 404 handler
    app.use(error_handler_1.notFoundHandler);
    // Global error handler (must be last)
    app.use(error_handler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
/**
 * Start the server
 */
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await database_1.db.testConnection();
        if (!dbConnected) {
            throw new Error('Failed to connect to database');
        }
        // Create Express app
        const app = createApp();
        // Start server
        const server = app.listen(env_1.config.port, () => {
            logger_1.logger.info({
                port: env_1.config.port,
                env: env_1.config.env,
                nodeVersion: process.version,
            }, `🚀 UWPlanit API server running on port ${env_1.config.port}`);
        });
        // Schedule background jobs
        if (env_1.config.isProduction) {
            (0, scheduler_1.scheduleJobs)();
        }
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, starting graceful shutdown`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await database_1.db.close();
                    logger_1.logger.info('Database connection closed');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error({ err: error }, 'Error during shutdown');
                    process.exit(1);
                }
            });
            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger_1.logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        // Handle unhandled rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error({ reason, promise }, 'Unhandled Promise Rejection');
        });
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger_1.logger.error({ err: error }, 'Uncaught Exception');
            process.exit(1);
        });
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};
exports.startServer = startServer;
// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=index.js.map