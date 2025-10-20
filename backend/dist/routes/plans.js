"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plan_service_1 = require("../services/plan-service");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
// All plan routes require authentication
router.use(auth_1.authenticate);
/**
 * GET /api/v1/plans/mine
 * Get all plans for the authenticated user
 */
router.get('/mine', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const plans = await plan_service_1.planService.getUserPlans(userId);
        res.json({
            data: plans,
            meta: {
                total: plans.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/plans
 * Create a new plan
 */
router.post('/', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name } = validators_1.createPlanSchema.parse(req.body);
        const plan = await plan_service_1.planService.createPlan(userId, name);
        res.status(201).json({
            data: plan,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/plans/:plan_id
 * Get a specific plan
 */
router.get('/:plan_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
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
        const items = await plan_service_1.planService.getPlanItems(planId, userId);
        res.json({
            data: {
                ...plan,
                items,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/v1/plans/:plan_id
 * Update a plan
 */
router.patch('/:plan_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const updates = validators_1.updatePlanSchema.parse(req.body);
        const plan = await plan_service_1.planService.updatePlan(planId, userId, updates);
        res.json({
            data: plan,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/v1/plans/:plan_id
 * Delete a plan
 */
router.delete('/:plan_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        await plan_service_1.planService.deletePlan(planId, userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/plans/:plan_id/items
 * Add an item to a plan
 */
router.post('/:plan_id/items', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const data = validators_1.createPlanItemSchema.parse(req.body);
        const item = await plan_service_1.planService.addPlanItem(planId, userId, data);
        res.status(201).json({
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/v1/plans/:plan_id/items/:plan_item_id
 * Update a plan item
 */
router.patch('/:plan_id/items/:plan_item_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const planItemId = validators_1.uuidSchema.parse(req.params.plan_item_id);
        const updates = validators_1.updatePlanItemSchema.parse(req.body);
        const item = await plan_service_1.planService.updatePlanItem(planItemId, planId, userId, updates);
        res.json({
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/v1/plans/:plan_id/items/:plan_item_id
 * Delete a plan item
 */
router.delete('/:plan_id/items/:plan_item_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const planItemId = validators_1.uuidSchema.parse(req.params.plan_item_id);
        await plan_service_1.planService.deletePlanItem(planItemId, planId, userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/plans/:plan_id/export
 * Export a plan as JSON
 */
router.get('/:plan_id/export', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const exportData = await plan_service_1.planService.exportPlan(planId, userId);
        res.json({
            data: exportData,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/plans/import
 * Import a plan from JSON
 */
router.post('/import', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const importData = validators_1.importPlanSchema.parse(req.body);
        // Create the plan
        const plan = await plan_service_1.planService.createPlan(userId, importData.name);
        // Add items if provided
        if (importData.items && importData.items.length > 0) {
            for (const item of importData.items) {
                await plan_service_1.planService.addPlanItem(plan.plan_id, userId, item);
            }
        }
        // Add checklist items if provided
        if (importData.checklist && importData.checklist.length > 0) {
            const { checklistService } = await Promise.resolve().then(() => __importStar(require('../services/checklist-service')));
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=plans.js.map