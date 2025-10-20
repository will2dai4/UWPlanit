/**
 * General rate limiter for all requests
 * Uses in-memory store (suitable for single-instance deployments)
 */
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Stricter rate limiter for write operations
 */
export declare const writeRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Very strict rate limiter for auth operations
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limit.d.ts.map