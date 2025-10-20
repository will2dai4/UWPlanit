import { Request, Response, NextFunction } from 'express';
/**
 * Custom application error class
 */
export declare class AppError extends Error {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
}
/**
 * Global error handler middleware
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 Not Found handler
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=error-handler.d.ts.map