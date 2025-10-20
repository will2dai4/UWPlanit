"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("./logger");
/**
 * Redis client for caching
 */
class RedisClient {
    static instance;
    client;
    constructor() {
        this.client = new ioredis_1.default(env_1.config.redis.url, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError: (err) => {
                logger_1.logger.error({ err }, 'Redis connection error');
                return true;
            },
        });
        this.client.on('connect', () => {
            logger_1.logger.info('Redis client connected');
        });
        this.client.on('error', (err) => {
            logger_1.logger.error({ err }, 'Redis client error');
        });
        this.client.on('ready', () => {
            logger_1.logger.info('Redis client ready');
        });
    }
    static getInstance() {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }
    /**
     * Get a value from Redis
     */
    async get(key) {
        try {
            const value = await this.client.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error({ err: error, key }, 'Redis GET error');
            return null;
        }
    }
    /**
     * Set a value in Redis with optional TTL
     */
    async set(key, value, ttlSeconds) {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error({ err: error, key }, 'Redis SET error');
            return false;
        }
    }
    /**
     * Delete a key from Redis
     */
    async del(key) {
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            logger_1.logger.error({ err: error, key }, 'Redis DEL error');
            return false;
        }
    }
    /**
     * Delete multiple keys matching a pattern
     */
    async delPattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length === 0)
                return 0;
            const pipeline = this.client.pipeline();
            keys.forEach(key => pipeline.del(key));
            await pipeline.exec();
            logger_1.logger.info({ pattern, count: keys.length }, 'Deleted keys matching pattern');
            return keys.length;
        }
        catch (error) {
            logger_1.logger.error({ err: error, pattern }, 'Redis DEL pattern error');
            return 0;
        }
    }
    /**
     * Check if a key exists
     */
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error({ err: error, key }, 'Redis EXISTS error');
            return false;
        }
    }
    /**
     * Close Redis connection
     */
    async close() {
        await this.client.quit();
        logger_1.logger.info('Redis client closed');
    }
}
exports.redis = RedisClient.getInstance();
//# sourceMappingURL=redis.js.map