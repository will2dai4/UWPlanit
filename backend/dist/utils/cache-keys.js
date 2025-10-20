"use strict";
/**
 * Centralized cache key generation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheTTL = exports.cacheKeys = void 0;
const CACHE_VERSION = 'v1';
exports.cacheKeys = {
    /**
     * Global graph cache key
     */
    graphGlobal: () => `graph:global:${CACHE_VERSION}`,
    /**
     * Subject-specific graph cache key
     */
    graphSubject: (subject) => `graph:subject:${subject.toUpperCase()}:${CACHE_VERSION}`,
    /**
     * Course details cache key
     */
    course: (subject, catalogNumber) => `course:${subject.toUpperCase()}:${catalogNumber}:${CACHE_VERSION}`,
    /**
     * Search results cache key
     */
    search: (queryParams) => {
        const sortedParams = Object.keys(queryParams)
            .sort()
            .map(key => `${key}=${queryParams[key]}`)
            .join(':');
        return `search:${sortedParams}:${CACHE_VERSION}`;
    },
    /**
     * Course relations cache key
     */
    courseRelations: (courseId) => `relations:${courseId}:${CACHE_VERSION}`,
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
};
/**
 * Cache TTL values in seconds
 */
exports.cacheTTL = {
    graph: 24 * 60 * 60, // 24 hours
    course: 12 * 60 * 60, // 12 hours
    search: 4 * 60 * 60, // 4 hours
    relations: 24 * 60 * 60, // 24 hours
    etlLock: 60 * 60, // 1 hour
};
//# sourceMappingURL=cache-keys.js.map