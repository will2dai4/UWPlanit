"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importPlanSchema = exports.parseChecklistTextSchema = exports.updateChecklistItemSchema = exports.createChecklistItemSchema = exports.updatePlanItemSchema = exports.createPlanItemSchema = exports.updatePlanSchema = exports.createPlanSchema = exports.courseSearchSchema = exports.paginationSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
/**
 * Common validation schemas
 */
exports.uuidSchema = zod_1.z.string().uuid();
exports.paginationSchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.courseSearchSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    level: zod_1.z.coerce.number().int().optional(),
    term: zod_1.z.enum(['FALL', 'WINTER', 'SPRING']).optional(),
    faculty: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.createPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
});
exports.updatePlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    is_public: zod_1.z.boolean().optional(),
});
exports.createPlanItemSchema = zod_1.z.object({
    course_id: exports.uuidSchema,
    term: zod_1.z.string().optional(),
    pos_x: zod_1.z.number().optional(),
    pos_y: zod_1.z.number().optional(),
});
exports.updatePlanItemSchema = zod_1.z.object({
    term: zod_1.z.string().optional(),
    pos_x: zod_1.z.number().optional(),
    pos_y: zod_1.z.number().optional(),
});
exports.createChecklistItemSchema = zod_1.z.object({
    label: zod_1.z.string().min(1).max(500),
    group_key: zod_1.z.string().optional(),
    required_count: zod_1.z.number().int().min(0).optional(),
    parent_id: exports.uuidSchema.optional(),
    position: zod_1.z.number().int().min(0).default(0),
});
exports.updateChecklistItemSchema = zod_1.z.object({
    label: zod_1.z.string().min(1).max(500).optional(),
    is_done: zod_1.z.boolean().optional(),
    group_key: zod_1.z.string().optional(),
    required_count: zod_1.z.number().int().min(0).optional(),
    position: zod_1.z.number().int().min(0).optional(),
});
exports.parseChecklistTextSchema = zod_1.z.object({
    text: zod_1.z.string().min(1),
});
exports.importPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    items: zod_1.z.array(zod_1.z.object({
        course_id: exports.uuidSchema,
        term: zod_1.z.string().optional(),
        pos_x: zod_1.z.number().optional(),
        pos_y: zod_1.z.number().optional(),
    })).optional(),
    checklist: zod_1.z.array(zod_1.z.object({
        label: zod_1.z.string().min(1).max(500),
        is_done: zod_1.z.boolean().default(false),
        group_key: zod_1.z.string().optional(),
        required_count: zod_1.z.number().int().min(0).optional(),
        parent_id: zod_1.z.string().optional(),
        position: zod_1.z.number().int().min(0).default(0),
    })).optional(),
});
//# sourceMappingURL=validators.js.map