import Redis from 'ioredis';
/**
 * Redis client for caching
 */
declare class RedisClient {
    private static instance;
    client: Redis;
    private constructor();
    static getInstance(): RedisClient;
    /**
     * Get a value from Redis
     */
    get<T = unknown>(key: string): Promise<T | null>;
    /**
     * Set a value in Redis with optional TTL
     */
    set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean>;
    /**
     * Delete a key from Redis
     */
    del(key: string): Promise<boolean>;
    /**
     * Delete multiple keys matching a pattern
     */
    delPattern(pattern: string): Promise<number>;
    /**
     * Check if a key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Close Redis connection
     */
    close(): Promise<void>;
}
export declare const redis: RedisClient;
export {};
//# sourceMappingURL=redis.d.ts.map