"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("./env");
/**
 * Centralized logger instance using Pino
 */
exports.logger = (0, pino_1.default)({
    level: env_1.config.logging.level,
    transport: env_1.config.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    serializers: {
        req: pino_1.default.stdSerializers.req,
        res: pino_1.default.stdSerializers.res,
        err: pino_1.default.stdSerializers.err,
    },
});
/**
 * Create a child logger with additional context
 */
const createLogger = (context) => {
    return exports.logger.child(context);
};
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map