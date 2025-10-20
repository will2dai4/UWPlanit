import { z } from 'zod';
/**
 * Common validation schemas
 */
export declare const uuidSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const courseSearchSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    level: z.ZodOptional<z.ZodNumber>;
    term: z.ZodOptional<z.ZodEnum<["FALL", "WINTER", "SPRING"]>>;
    faculty: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    level?: number | undefined;
    search?: string | undefined;
    subject?: string | undefined;
    term?: "FALL" | "WINTER" | "SPRING" | undefined;
    faculty?: string | undefined;
}, {
    level?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    subject?: string | undefined;
    term?: "FALL" | "WINTER" | "SPRING" | undefined;
    faculty?: string | undefined;
    offset?: number | undefined;
}>;
export declare const createPlanSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const updatePlanSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    is_public: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    is_public?: boolean | undefined;
}, {
    name?: string | undefined;
    is_public?: boolean | undefined;
}>;
export declare const createPlanItemSchema: z.ZodObject<{
    course_id: z.ZodString;
    term: z.ZodOptional<z.ZodString>;
    pos_x: z.ZodOptional<z.ZodNumber>;
    pos_y: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    course_id: string;
    term?: string | undefined;
    pos_x?: number | undefined;
    pos_y?: number | undefined;
}, {
    course_id: string;
    term?: string | undefined;
    pos_x?: number | undefined;
    pos_y?: number | undefined;
}>;
export declare const updatePlanItemSchema: z.ZodObject<{
    term: z.ZodOptional<z.ZodString>;
    pos_x: z.ZodOptional<z.ZodNumber>;
    pos_y: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    term?: string | undefined;
    pos_x?: number | undefined;
    pos_y?: number | undefined;
}, {
    term?: string | undefined;
    pos_x?: number | undefined;
    pos_y?: number | undefined;
}>;
export declare const createChecklistItemSchema: z.ZodObject<{
    label: z.ZodString;
    group_key: z.ZodOptional<z.ZodString>;
    required_count: z.ZodOptional<z.ZodNumber>;
    parent_id: z.ZodOptional<z.ZodString>;
    position: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    label: string;
    position: number;
    group_key?: string | undefined;
    required_count?: number | undefined;
    parent_id?: string | undefined;
}, {
    label: string;
    group_key?: string | undefined;
    required_count?: number | undefined;
    parent_id?: string | undefined;
    position?: number | undefined;
}>;
export declare const updateChecklistItemSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    is_done: z.ZodOptional<z.ZodBoolean>;
    group_key: z.ZodOptional<z.ZodString>;
    required_count: z.ZodOptional<z.ZodNumber>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    label?: string | undefined;
    group_key?: string | undefined;
    required_count?: number | undefined;
    position?: number | undefined;
    is_done?: boolean | undefined;
}, {
    label?: string | undefined;
    group_key?: string | undefined;
    required_count?: number | undefined;
    position?: number | undefined;
    is_done?: boolean | undefined;
}>;
export declare const parseChecklistTextSchema: z.ZodObject<{
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
}, {
    text: string;
}>;
export declare const importPlanSchema: z.ZodObject<{
    name: z.ZodString;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        course_id: z.ZodString;
        term: z.ZodOptional<z.ZodString>;
        pos_x: z.ZodOptional<z.ZodNumber>;
        pos_y: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        course_id: string;
        term?: string | undefined;
        pos_x?: number | undefined;
        pos_y?: number | undefined;
    }, {
        course_id: string;
        term?: string | undefined;
        pos_x?: number | undefined;
        pos_y?: number | undefined;
    }>, "many">>;
    checklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        is_done: z.ZodDefault<z.ZodBoolean>;
        group_key: z.ZodOptional<z.ZodString>;
        required_count: z.ZodOptional<z.ZodNumber>;
        parent_id: z.ZodOptional<z.ZodString>;
        position: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        label: string;
        position: number;
        is_done: boolean;
        group_key?: string | undefined;
        required_count?: number | undefined;
        parent_id?: string | undefined;
    }, {
        label: string;
        group_key?: string | undefined;
        required_count?: number | undefined;
        parent_id?: string | undefined;
        position?: number | undefined;
        is_done?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    items?: {
        course_id: string;
        term?: string | undefined;
        pos_x?: number | undefined;
        pos_y?: number | undefined;
    }[] | undefined;
    checklist?: {
        label: string;
        position: number;
        is_done: boolean;
        group_key?: string | undefined;
        required_count?: number | undefined;
        parent_id?: string | undefined;
    }[] | undefined;
}, {
    name: string;
    items?: {
        course_id: string;
        term?: string | undefined;
        pos_x?: number | undefined;
        pos_y?: number | undefined;
    }[] | undefined;
    checklist?: {
        label: string;
        group_key?: string | undefined;
        required_count?: number | undefined;
        parent_id?: string | undefined;
        position?: number | undefined;
        is_done?: boolean | undefined;
    }[] | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map