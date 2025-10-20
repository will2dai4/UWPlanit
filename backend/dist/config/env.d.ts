export declare const config: {
    readonly env: "development" | "production" | "test";
    readonly port: number;
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly isTest: boolean;
    readonly database: {
        readonly url: string;
    };
    readonly supabase: {
        readonly url: string;
        readonly anonKey: string;
        readonly serviceRoleKey: string | undefined;
        readonly jwtSecret: string;
    };
    readonly uwApi: {
        readonly baseUrl: string;
        readonly apiKey: string | undefined;
    };
    readonly cors: {
        readonly origin: string[];
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
    readonly logging: {
        readonly level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    };
    readonly sentry: {
        readonly dsn: string | undefined;
    };
};
export type Config = typeof config;
//# sourceMappingURL=env.d.ts.map