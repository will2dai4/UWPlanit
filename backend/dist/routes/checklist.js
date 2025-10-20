"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checklist_service_1 = require("../services/checklist-service");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
// All checklist routes require authentication
router.use(auth_1.authenticate);
/**
 * GET /api/v1/plans/:plan_id/checklist
 * Get all checklist items for a plan
 */
router.get('/:plan_id/checklist', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const items = await checklist_service_1.checklistService.getChecklistItems(planId, userId);
        res.json({
            data: items,
            meta: {
                total: items.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/plans/:plan_id/checklist
 * Create a new checklist item
 */
router.post('/:plan_id/checklist', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const data = validators_1.createChecklistItemSchema.parse(req.body);
        const item = await checklist_service_1.checklistService.createChecklistItem(planId, userId, data);
        res.status(201).json({
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/v1/plans/:plan_id/checklist/:item_id
 * Update a checklist item
 */
router.patch('/:plan_id/checklist/:item_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const itemId = validators_1.uuidSchema.parse(req.params.item_id);
        const updates = validators_1.updateChecklistItemSchema.parse(req.body);
        const item = await checklist_service_1.checklistService.updateChecklistItem(itemId, planId, userId, updates);
        res.json({
            data: item,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/v1/plans/:plan_id/checklist/:item_id
 * Delete a checklist item
 */
router.delete('/:plan_id/checklist/:item_id', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const itemId = validators_1.uuidSchema.parse(req.params.item_id);
        await checklist_service_1.checklistService.deleteChecklistItem(itemId, planId, userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/plans/:plan_id/checklist/parse-text
 * Parse text into checklist items and create them
 */
router.post('/:plan_id/checklist/parse-text', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const planId = validators_1.uuidSchema.parse(req.params.plan_id);
        const { text } = validators_1.parseChecklistTextSchema.parse(req.body);
        // Parse the text
        const parsed = checklist_service_1.checklistService.parseText(text);
        // Create the items
        const items = await checklist_service_1.checklistService.createFromParsedItems(planId, userId, parsed);
        res.status(201).json({
            data: items,
            meta: {
                total: items.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=checklist.js.map