import { z } from 'zod';

/**
 * Common validation schemas
 */

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const courseSearchSchema = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  level: z.coerce.number().int().optional(),
  term: z.enum(['FALL', 'WINTER', 'SPRING']).optional(),
  faculty: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createPlanSchema = z.object({
  name: z.string().min(1).max(255),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  is_public: z.boolean().optional(),
});

export const createPlanItemSchema = z.object({
  course_id: uuidSchema,
  term: z.string().optional(),
  pos_x: z.number().optional(),
  pos_y: z.number().optional(),
});

export const updatePlanItemSchema = z.object({
  term: z.string().optional(),
  pos_x: z.number().optional(),
  pos_y: z.number().optional(),
});

export const createChecklistItemSchema = z.object({
  label: z.string().min(1).max(500),
  group_key: z.string().optional(),
  required_count: z.number().int().min(0).optional(),
  parent_id: uuidSchema.optional(),
  position: z.number().int().min(0).default(0),
});

export const updateChecklistItemSchema = z.object({
  label: z.string().min(1).max(500).optional(),
  is_done: z.boolean().optional(),
  group_key: z.string().optional(),
  required_count: z.number().int().min(0).optional(),
  position: z.number().int().min(0).optional(),
});

export const parseChecklistTextSchema = z.object({
  text: z.string().min(1),
});

export const importPlanSchema = z.object({
  name: z.string().min(1).max(255),
  items: z.array(z.object({
    course_id: uuidSchema,
    term: z.string().optional(),
    pos_x: z.number().optional(),
    pos_y: z.number().optional(),
  })).optional(),
  checklist: z.array(z.object({
    label: z.string().min(1).max(500),
    is_done: z.boolean().default(false),
    group_key: z.string().optional(),
    required_count: z.number().int().min(0).optional(),
    parent_id: z.string().optional(),
    position: z.number().int().min(0).default(0),
  })).optional(),
});

