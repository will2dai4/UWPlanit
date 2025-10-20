"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Environment variable schema validation
 */
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('4000'),
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: zod_1.z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: zod_1.z.string(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    SUPABASE_JWT_SECRET: zod_1.z.string(),
    // UW API
    UW_API_BASE: zod_1.z.string().url().default('https://openapi.data.uwaterloo.ca/v3'),
    UW_API_KEY: zod_1.z.string().optional(),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3000'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('60000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('60'),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    // Observability
    SENTRY_DSN: zod_1.z.string().optional(),
});
let env;
try {
    env = envSchema.parse(process.env);
}
catch (error) {
    if (error instanceof zod_1.z.ZodError) {
        console.error('❌ Invalid environment variables:');
        console.error(JSON.stringify(error.errors, null, 2));
        process.exit(1);
    }
    throw error;
}
exports.config = {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
    database: {
        url: env.DATABASE_URL,
    },
    supabase: {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecret: env.SUPABASE_JWT_SECRET,
    },
    uwApi: {
        baseUrl: env.UW_API_BASE,
        apiKey: env.UW_API_KEY,
    },
    cors: {
        origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
    },
    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
    },
    logging: {
        level: env.LOG_LEVEL,
    },
    sentry: {
        dsn: env.SENTRY_DSN,
    },
};
//# sourceMappingURL=env.js.map