/**
 * Centralized cache key generation utilities
 */
export declare const cacheKeys: {
    /**
     * Global graph cache key
     */
    readonly graphGlobal: () => string;
    /**
     * Subject-specific graph cache key
     */
    readonly graphSubject: (subject: string) => string;
    /**
     * Course details cache key
     */
    readonly course: (subject: string, catalogNumber: string) => string;
    /**
     * Search results cache key
     */
    readonly search: (queryParams: Record<string, unknown>) => string;
    /**
     * Course relations cache key
     */
    readonly courseRelations: (courseId: string) => string;
    /**
     * All graph-related keys pattern
     */
    readonly allGraphs: () => string;
    /**
     * All search keys pattern
     */
    readonly allSearches: () => string;
    /**
     * ETL lock key
     */
    readonly etlLock: () => string;
};
/**
 * Cache TTL values in seconds
 */
export declare const cacheTTL: {
    readonly graph: number;
    readonly course: number;
    readonly search: number;
    readonly relations: number;
    readonly etlLock: number;
};
//# sourceMappingURL=cache-keys.d.ts.map