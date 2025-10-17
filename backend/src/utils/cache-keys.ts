/**
 * Centralized cache key generation utilities
 */

const CACHE_VERSION = 'v1';

export const cacheKeys = {
  /**
   * Global graph cache key
   */
  graphGlobal: () => `graph:global:${CACHE_VERSION}`,

  /**
   * Subject-specific graph cache key
   */
  graphSubject: (subject: string) => `graph:subject:${subject.toUpperCase()}:${CACHE_VERSION}`,

  /**
   * Course details cache key
   */
  course: (subject: string, catalogNumber: string) => 
    `course:${subject.toUpperCase()}:${catalogNumber}:${CACHE_VERSION}`,

  /**
   * Search results cache key
   */
  search: (queryParams: Record<string, unknown>) => {
    const sortedParams = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join(':');
    return `search:${sortedParams}:${CACHE_VERSION}`;
  },

  /**
   * Course relations cache key
   */
  courseRelations: (courseId: string) => `relations:${courseId}:${CACHE_VERSION}`,

  /**
   * All graph-related keys pattern
   */
  allGraphs: () => `graph:*:${CACHE_VERSION}`,

  /**
   * All search keys pattern
   */
  allSearches: () => `search:*:${CACHE_VERSION}`,

  /**
   * ETL lock key
   */
  etlLock: () => 'etl:lock',
} as const;

/**
 * Cache TTL values in seconds
 */
export const cacheTTL = {
  graph: 24 * 60 * 60, // 24 hours
  course: 12 * 60 * 60, // 12 hours
  search: 4 * 60 * 60, // 4 hours
  relations: 24 * 60 * 60, // 24 hours
  etlLock: 60 * 60, // 1 hour
} as const;

