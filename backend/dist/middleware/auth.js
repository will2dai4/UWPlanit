"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jose = __importStar(require("jose"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
/**
 * Middleware to verify Supabase JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing or invalid authorization header',
                },
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        try {
            // Verify the JWT using Supabase JWT secret
            const secret = new TextEncoder().encode(env_1.config.supabase.jwtSecret);
            const { payload } = await jose.jwtVerify(token, secret, {
                issuer: env_1.config.supabase.url + '/auth/v1',
                audience: 'authenticated',
            });
            // Extract user information from JWT payload
            const userId = payload.sub;
            const email = payload.email;
            if (!userId) {
                res.status(401).json({
                    error: {
                        code: 'INVALID_TOKEN',
                        message: 'Token does not contain user ID',
                    },
                });
                return;
            }
            // Attach user to request
            req.user = {
                userId,
                email: email || '',
            };
            logger_1.logger.debug({ userId }, 'User authenticated');
            next();
        }
        catch (jwtError) {
            logger_1.logger.warn({ err: jwtError }, 'JWT verification failed');
            res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token',
                },
            });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error({ err: error }, 'Authentication middleware error');
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Authentication failed',
            },
        });
    }
};
exports.authenticate = authenticate;
/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }
    // If there is a token, validate it
    await (0, exports.authenticate)(req, res, next);
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map