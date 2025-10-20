import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * General rate limiter for all requests
 * Uses in-memory store (suitable for single-instance deployments)
 */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  skip: () => {
    // Skip rate limiting in test environment
    return config.isTest;
  },
});

/**
 * Stricter rate limiter for write operations
 */
export const writeRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.floor(config.rateLimit.maxRequests / 3), // 1/3 of general limit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'WRITE_RATE_LIMIT_EXCEEDED',
      message: 'Too many write requests, please try again later',
    },
  },
  skip: () => {
    return config.isTest;
  },
});

/**
 * Very strict rate limiter for auth operations
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  skip: () => {
    return config.isTest;
  },
});

