import { Router } from 'express';
import { checklistService } from '../services/checklist-service';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  createChecklistItemSchema,
  updateChecklistItemSchema,
  parseChecklistTextSchema,
  uuidSchema,
} from '../utils/validators';

const router = Router();

// All checklist routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/plans/:plan_id/checklist
 * Get all checklist items for a plan
 */
router.get('/:plan_id/checklist', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);

    const items = await checklistService.getChecklistItems(planId, userId);

    res.json({
      data: items,
      meta: {
        total: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/plans/:plan_id/checklist
 * Create a new checklist item
 */
router.post('/:plan_id/checklist', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const data = createChecklistItemSchema.parse(req.body);

    const item = await checklistService.createChecklistItem(planId, userId, data);

    res.status(201).json({
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/plans/:plan_id/checklist/:item_id
 * Update a checklist item
 */
router.patch('/:plan_id/checklist/:item_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const itemId = uuidSchema.parse(req.params.item_id);
    const updates = updateChecklistItemSchema.parse(req.body);

    const item = await checklistService.updateChecklistItem(itemId, planId, userId, updates);

    res.json({
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/plans/:plan_id/checklist/:item_id
 * Delete a checklist item
 */
router.delete('/:plan_id/checklist/:item_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const itemId = uuidSchema.parse(req.params.item_id);

    await checklistService.deleteChecklistItem(itemId, planId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/plans/:plan_id/checklist/parse-text
 * Parse text into checklist items and create them
 */
router.post('/:plan_id/checklist/parse-text', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const { text } = parseChecklistTextSchema.parse(req.body);

    // Parse the text
    const parsed = checklistService.parseText(text);

    // Create the items
    const items = await checklistService.createFromParsedItems(planId, userId, parsed);

    res.status(201).json({
      data: items,
      meta: {
        total: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

