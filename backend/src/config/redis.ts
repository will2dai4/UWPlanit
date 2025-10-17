import Redis from 'ioredis';
import { config } from './env';
import { logger } from './logger';

/**
 * Redis client for caching
 */
class RedisClient {
  private static instance: RedisClient;
  public client: Redis;

  private constructor() {
    this.client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.error({ err }, 'Redis connection error');
        return true;
      },
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('error', (err) => {
      logger.error({ err }, 'Redis client error');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Get a value from Redis
   */
  public async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ err: error, key }, 'Redis GET error');
      return null;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   */
  public async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error({ err: error, key }, 'Redis SET error');
      return false;
    }
  }

  /**
   * Delete a key from Redis
   */
  public async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error({ err: error, key }, 'Redis DEL error');
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  public async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const pipeline = this.client.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec();
      
      logger.info({ pattern, count: keys.length }, 'Deleted keys matching pattern');
      return keys.length;
    } catch (error) {
      logger.error({ err: error, pattern }, 'Redis DEL pattern error');
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error({ err: error, key }, 'Redis EXISTS error');
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  public async close(): Promise<void> {
    await this.client.quit();
    logger.info('Redis client closed');
  }
}

export const redis = RedisClient.getInstance();

