import pino from 'pino';
/**
 * Centralized logger instance using Pino
 */
export declare const logger: import("pino").Logger<never>;
/**
 * Create a child logger with additional context
 */
export declare const createLogger: (context: Record<string, unknown>) => pino.Logger<never>;
//# sourceMappingURL=logger.d.ts.map