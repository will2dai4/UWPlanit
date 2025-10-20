"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planService = exports.PlanService = void 0;
const database_1 = require("../config/database");
const error_handler_1 = require("../middleware/error-handler");
const logger_1 = require("../config/logger");
class PlanService {
    /**
     * Get all plans for a user
     */
    async getUserPlans(userId) {
        const query = 'SELECT * FROM plans WHERE user_id = $1 ORDER BY updated_at DESC';
        return database_1.db.query(query, [userId]);
    }
    /**
     * Get a plan by ID
     */
    async getPlanById(planId, userId) {
        const query = 'SELECT * FROM plans WHERE plan_id = $1 AND user_id = $2';
        return database_1.db.queryOne(query, [planId, userId]);
    }
    /**
     * Create a new plan
     */
    async createPlan(userId, name) {
        const query = `
      INSERT INTO plans (user_id, name)
      VALUES ($1, $2)
      RETURNING *
    `;
        const plan = await database_1.db.queryOne(query, [userId, name]);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_CREATE_FAILED', 'Failed to create plan', 500);
        }
        logger_1.logger.info({ planId: plan.plan_id, userId }, 'Plan created');
        return plan;
    }
    /**
     * Update a plan
     */
    async updatePlan(planId, userId, updates) {
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        if (updates.name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.is_public !== undefined) {
            setClauses.push(`is_public = $${paramIndex++}`);
            values.push(updates.is_public);
        }
        if (setClauses.length === 0) {
            throw new error_handler_1.AppError('NO_UPDATES', 'No fields to update', 400);
        }
        values.push(planId, userId);
        const query = `
      UPDATE plans
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE plan_id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;
        const plan = await database_1.db.queryOne(query, values);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        logger_1.logger.info({ planId, userId }, 'Plan updated');
        return plan;
    }
    /**
     * Delete a plan
     */
    async deletePlan(planId, userId) {
        const query = 'DELETE FROM plans WHERE plan_id = $1 AND user_id = $2';
        const result = await database_1.db.query(query, [planId, userId]);
        if (result.length === 0) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        logger_1.logger.info({ planId, userId }, 'Plan deleted');
    }
    /**
     * Get all items in a plan
     */
    async getPlanItems(planId, userId) {
        // Verify plan ownership
        const plan = await this.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = 'SELECT * FROM plan_items WHERE plan_id = $1 ORDER BY created_at';
        return database_1.db.query(query, [planId]);
    }
    /**
     * Add an item to a plan
     */
    async addPlanItem(planId, userId, data) {
        // Verify plan ownership
        const plan = await this.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = `
      INSERT INTO plan_items (plan_id, course_id, term, pos_x, pos_y)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const item = await database_1.db.queryOne(query, [
            planId,
            data.course_id,
            data.term || null,
            data.pos_x || null,
            data.pos_y || null,
        ]);
        if (!item) {
            throw new error_handler_1.AppError('PLAN_ITEM_CREATE_FAILED', 'Failed to add item to plan', 500);
        }
        logger_1.logger.info({ planId, itemId: item.plan_item_id }, 'Plan item added');
        return item;
    }
    /**
     * Update a plan item
     */
    async updatePlanItem(planItemId, planId, userId, updates) {
        // Verify plan ownership
        const plan = await this.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        if (updates.term !== undefined) {
            setClauses.push(`term = $${paramIndex++}`);
            values.push(updates.term);
        }
        if (updates.pos_x !== undefined) {
            setClauses.push(`pos_x = $${paramIndex++}`);
            values.push(updates.pos_x);
        }
        if (updates.pos_y !== undefined) {
            setClauses.push(`pos_y = $${paramIndex++}`);
            values.push(updates.pos_y);
        }
        if (setClauses.length === 0) {
            throw new error_handler_1.AppError('NO_UPDATES', 'No fields to update', 400);
        }
        values.push(planItemId, planId);
        const query = `
      UPDATE plan_items
      SET ${setClauses.join(', ')}
      WHERE plan_item_id = $${paramIndex++} AND plan_id = $${paramIndex++}
      RETURNING *
    `;
        const item = await database_1.db.queryOne(query, values);
        if (!item) {
            throw new error_handler_1.AppError('PLAN_ITEM_NOT_FOUND', 'Plan item not found', 404);
        }
        return item;
    }
    /**
     * Delete a plan item
     */
    async deletePlanItem(planItemId, planId, userId) {
        // Verify plan ownership
        const plan = await this.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const query = 'DELETE FROM plan_items WHERE plan_item_id = $1 AND plan_id = $2';
        await database_1.db.query(query, [planItemId, planId]);
        logger_1.logger.info({ planItemId, planId }, 'Plan item deleted');
    }
    /**
     * Export a plan as JSON
     */
    async exportPlan(planId, userId) {
        const plan = await this.getPlanById(planId, userId);
        if (!plan) {
            throw new error_handler_1.AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
        }
        const items = await this.getPlanItems(planId, userId);
        const checklist = await database_1.db.query('SELECT * FROM checklist_items WHERE plan_id = $1 ORDER BY position', [planId]);
        return { plan, items, checklist };
    }
}
exports.PlanService = PlanService;
exports.planService = new PlanService();
//# sourceMappingURL=plan-service.js.map