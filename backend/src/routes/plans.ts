import { Router } from 'express';
import { planService } from '../services/plan-service';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  createPlanSchema,
  updatePlanSchema,
  createPlanItemSchema,
  updatePlanItemSchema,
  uuidSchema,
  importPlanSchema,
} from '../utils/validators';

const router = Router();

// All plan routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/plans/mine
 * Get all plans for the authenticated user
 */
router.get('/mine', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const plans = await planService.getUserPlans(userId);

    res.json({
      data: plans,
      meta: {
        total: plans.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/plans
 * Create a new plan
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const { name } = createPlanSchema.parse(req.body);

    const plan = await planService.createPlan(userId, name);

    res.status(201).json({
      data: plan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/plans/:plan_id
 * Get a specific plan
 */
router.get('/:plan_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);

    const plan = await planService.getPlanById(planId, userId);

    if (!plan) {
      res.status(404).json({
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Plan not found',
        },
      });
      return;
    }

    // Get plan items
    const items = await planService.getPlanItems(planId, userId);

    res.json({
      data: {
        ...plan,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/plans/:plan_id
 * Update a plan
 */
router.patch('/:plan_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const updates = updatePlanSchema.parse(req.body);

    const plan = await planService.updatePlan(planId, userId, updates);

    res.json({
      data: plan,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/plans/:plan_id
 * Delete a plan
 */
router.delete('/:plan_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);

    await planService.deletePlan(planId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/plans/:plan_id/items
 * Add an item to a plan
 */
router.post('/:plan_id/items', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const data = createPlanItemSchema.parse(req.body);

    const item = await planService.addPlanItem(planId, userId, data);

    res.status(201).json({
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/plans/:plan_id/items/:plan_item_id
 * Update a plan item
 */
router.patch('/:plan_id/items/:plan_item_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const planItemId = uuidSchema.parse(req.params.plan_item_id);
    const updates = updatePlanItemSchema.parse(req.body);

    const item = await planService.updatePlanItem(planItemId, planId, userId, updates);

    res.json({
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/plans/:plan_id/items/:plan_item_id
 * Delete a plan item
 */
router.delete('/:plan_id/items/:plan_item_id', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);
    const planItemId = uuidSchema.parse(req.params.plan_item_id);

    await planService.deletePlanItem(planItemId, planId, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/plans/:plan_id/export
 * Export a plan as JSON
 */
router.get('/:plan_id/export', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const planId = uuidSchema.parse(req.params.plan_id);

    const exportData = await planService.exportPlan(planId, userId);

    res.json({
      data: exportData,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/plans/import
 * Import a plan from JSON
 */
router.post('/import', async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.userId;
    const importData = importPlanSchema.parse(req.body);

    // Create the plan
    const plan = await planService.createPlan(userId, importData.name);

    // Add items if provided
    if (importData.items && importData.items.length > 0) {
      for (const item of importData.items) {
        await planService.addPlanItem(plan.plan_id, userId, item);
      }
    }

    // Add checklist items if provided
    if (importData.checklist && importData.checklist.length > 0) {
      const { checklistService } = await import('../services/checklist-service');
      
      for (const item of importData.checklist) {
        await checklistService.createChecklistItem(plan.plan_id, userId, {
          label: item.label,
          group_key: item.group_key,
          required_count: item.required_count,
          position: item.position,
        });
      }
    }

    res.status(201).json({
      data: {
        plan_id: plan.plan_id,
        message: 'Plan imported successfully',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

