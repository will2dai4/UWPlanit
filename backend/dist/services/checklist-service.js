"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checklistService = exports.ChecklistService = void 0;
const database_1 = require("../config/database");
const error_handler_1 = require("../middleware/error-handler");
const checklist_parser_1 = require("../utils/checklist-parser");
const logger_1 = require("../config/logger");
const plan_service_1 = require("./plan-service");
class ChecklistService {
    /**
     * Get all checklist items for a plan
     */
    async getChecklistItems(planId, userId) {
        // Verify plan ownership
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = `
      SELECT * FROM checklist_items
      WHERE plan_id = $1
      ORDER BY position, created_at
    `;
        return database_1.db.query(query, [planId]);
    }
    /**
     * Create a checklist item
     */
    async createChecklistItem(planId, userId, data) {
        // Verify plan ownership
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = `
      INSERT INTO checklist_items (plan_id, label, group_key, required_count, parent_id, position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const item = await database_1.db.queryOne(query, [
            planId,
            data.label,
            data.group_key || null,
            data.required_count || null,
            data.parent_id || null,
            data.position || 0,
        ]);
        if (!item) {
            throw new error_handler_1.AppError('CHECKLIST_ITEM_CREATE_FAILED', 'Failed to create checklist item', 500);
        }
        logger_1.logger.info({ planId, itemId: item.checklist_item_id }, 'Checklist item created');
        return item;
    }
    /**
     * Update a checklist item
     */
    async updateChecklistItem(itemId, planId, userId, updates) {
        // Verify plan ownership
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        if (updates.label !== undefined) {
            setClauses.push(`label = $${paramIndex++}`);
            values.push(updates.label);
        }
        if (updates.is_done !== undefined) {
            setClauses.push(`is_done = $${paramIndex++}`);
            values.push(updates.is_done);
        }
        if (updates.group_key !== undefined) {
            setClauses.push(`group_key = $${paramIndex++}`);
            values.push(updates.group_key);
        }
        if (updates.required_count !== undefined) {
            setClauses.push(`required_count = $${paramIndex++}`);
            values.push(updates.required_count);
        }
        if (updates.position !== undefined) {
            setClauses.push(`position = $${paramIndex++}`);
            values.push(updates.position);
        }
        if (setClauses.length === 0) {
            throw new error_handler_1.AppError('NO_UPDATES', 'No fields to update', 400);
        }
        values.push(itemId, planId);
        const query = `
      UPDATE checklist_items
      SET ${setClauses.join(', ')}
      WHERE checklist_item_id = $${paramIndex++} AND plan_id = $${paramIndex++}
      RETURNING *
    `;
        const item = await database_1.db.queryOne(query, values);
        if (!item) {
            throw new error_handler_1.AppError('CHECKLIST_ITEM_NOT_FOUND', 'Checklist item not found', 404);
        }
        return item;
    }
    /**
     * Delete a checklist item
     */
    async deleteChecklistItem(itemId, planId, userId) {
        // Verify plan ownership
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = 'DELETE FROM checklist_items WHERE checklist_item_id = $1 AND plan_id = $2';
        await database_1.db.query(query, [itemId, planId]);
        logger_1.logger.info({ itemId, planId }, 'Checklist item deleted');
    }
    /**
     * Parse text into checklist items (returns parsed structure, doesn't save)
     */
    parseText(text) {
        return (0, checklist_parser_1.parseChecklistText)(text);
    }
    /**
     * Create checklist items from parsed text
     */
    async createFromParsedItems(planId, userId, items) {
        // Verify plan ownership
        const plan = await plan_service_1.planService.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const createdItems = [];
        // Recursive function to create items and their children
        const createItemsRecursively = async (itemsList, parentId = null) => {
            for (const item of itemsList) {
                const created = await this.createChecklistItem(planId, userId, {
                    label: item.label,
                    group_key: item.group_key,
                    required_count: item.required_count,
                    parent_id: parentId || undefined,
                    position: item.position,
                });
                createdItems.push(created);
                // Create children if they exist
                if (item.children && item.children.length > 0) {
                    await createItemsRecursively(item.children, created.checklist_item_id);
                }
            }
        };
        await createItemsRecursively(items);
        logger_1.logger.info({ planId, count: createdItems.length }, 'Checklist items created from text');
        return createdItems;
    }
}
exports.ChecklistService = ChecklistService;
exports.checklistService = new ChecklistService();
//# sourceMappingURL=checklist-service.js.map