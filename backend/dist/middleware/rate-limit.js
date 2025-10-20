"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.writeRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/**
 * General rate limiter for all requests
 * Uses in-memory store (suitable for single-instance deployments)
 */
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.rateLimit.windowMs,
    max: env_1.config.rateLimit.maxRequests,
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
        return env_1.config.isTest;
    },
});
/**
 * Stricter rate limiter for write operations
 */
exports.writeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.config.rateLimit.windowMs,
    max: Math.floor(env_1.config.rateLimit.maxRequests / 3), // 1/3 of general limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'WRITE_RATE_LIMIT_EXCEEDED',
            message: 'Too many write requests, please try again later',
        },
    },
    skip: () => {
        return env_1.config.isTest;
    },
});
/**
 * Very strict rate limiter for auth operations
 */
exports.authRateLimiter = (0, express_rate_limit_1.default)({
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
        return env_1.config.isTest;
    },
});
//# sourceMappingURL=rate-limit.js.map