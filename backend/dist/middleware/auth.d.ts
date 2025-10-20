import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify Supabase JWT tokens
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication - doesn't fail if no token provided
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map