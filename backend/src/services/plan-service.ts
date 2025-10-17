import { db } from '../config/database';
import { Plan, PlanItem, ChecklistItem } from '../types';
import { AppError } from '../middleware/error-handler';
import { logger } from '../config/logger';

export class PlanService {
  /**
   * Get all plans for a user
   */
  async getUserPlans(userId: string): Promise<Plan[]> {
    const query = 'SELECT * FROM plans WHERE user_id = $1 ORDER BY updated_at DESC';
    return db.query<Plan>(query, [userId]);
  }

  /**
   * Get a plan by ID
   */
  async getPlanById(planId: string, userId: string): Promise<Plan | null> {
    const query = 'SELECT * FROM plans WHERE plan_id = $1 AND user_id = $2';
    return db.queryOne<Plan>(query, [planId, userId]);
  }

  /**
   * Create a new plan
   */
  async createPlan(userId: string, name: string): Promise<Plan> {
    const query = `
      INSERT INTO plans (user_id, name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const plan = await db.queryOne<Plan>(query, [userId, name]);
    
    if (!plan) {
      throw new AppError('PLAN_CREATE_FAILED', 'Failed to create plan', 500);
    }

    logger.info({ planId: plan.plan_id, userId }, 'Plan created');
    return plan;
  }

  /**
   * Update a plan
   */
  async updatePlan(
    planId: string,
    userId: string,
    updates: { name?: string; is_public?: boolean }
  ): Promise<Plan> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
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
      throw new AppError('NO_UPDATES', 'No fields to update', 400);
    }

    values.push(planId, userId);
    const query = `
      UPDATE plans
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE plan_id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    const plan = await db.queryOne<Plan>(query, values);

    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    logger.info({ planId, userId }, 'Plan updated');
    return plan;
  }

  /**
   * Delete a plan
   */
  async deletePlan(planId: string, userId: string): Promise<void> {
    const query = 'DELETE FROM plans WHERE plan_id = $1 AND user_id = $2';
    const result = await db.query(query, [planId, userId]);

    if (result.length === 0) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    logger.info({ planId, userId }, 'Plan deleted');
  }

  /**
   * Get all items in a plan
   */
  async getPlanItems(planId: string, userId: string): Promise<PlanItem[]> {
    // Verify plan ownership
    const plan = await this.getPlanById(planId, userId);
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    const query = 'SELECT * FROM plan_items WHERE plan_id = $1 ORDER BY created_at';
    return db.query<PlanItem>(query, [planId]);
  }

  /**
   * Add an item to a plan
   */
  async addPlanItem(
    planId: string,
    userId: string,
    data: {
      course_id: string;
      term?: string;
      pos_x?: number;
      pos_y?: number;
    }
  ): Promise<PlanItem> {
    // Verify plan ownership
    const plan = await this.getPlanById(planId, userId);
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    const query = `
      INSERT INTO plan_items (plan_id, course_id, term, pos_x, pos_y)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const item = await db.queryOne<PlanItem>(query, [
      planId,
      data.course_id,
      data.term || null,
      data.pos_x || null,
      data.pos_y || null,
    ]);

    if (!item) {
      throw new AppError('PLAN_ITEM_CREATE_FAILED', 'Failed to add item to plan', 500);
    }

    logger.info({ planId, itemId: item.plan_item_id }, 'Plan item added');
    return item;
  }

  /**
   * Update a plan item
   */
  async updatePlanItem(
    planItemId: string,
    planId: string,
    userId: string,
    updates: {
      term?: string;
      pos_x?: number;
      pos_y?: number;
    }
  ): Promise<PlanItem> {
    // Verify plan ownership
    const plan = await this.getPlanById(planId, userId);
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
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
      throw new AppError('NO_UPDATES', 'No fields to update', 400);
    }

    values.push(planItemId, planId);
    const query = `
      UPDATE plan_items
      SET ${setClauses.join(', ')}
      WHERE plan_item_id = $${paramIndex++} AND plan_id = $${paramIndex++}
      RETURNING *
    `;

    const item = await db.queryOne<PlanItem>(query, values);

    if (!item) {
      throw new AppError('PLAN_ITEM_NOT_FOUND', 'Plan item not found', 404);
    }

    return item;
  }

  /**
   * Delete a plan item
   */
  async deletePlanItem(planItemId: string, planId: string, userId: string): Promise<void> {
    // Verify plan ownership
    const plan = await this.getPlanById(planId, userId);
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    const query = 'DELETE FROM plan_items WHERE plan_item_id = $1 AND plan_id = $2';
    await db.query(query, [planItemId, planId]);

    logger.info({ planItemId, planId }, 'Plan item deleted');
  }

  /**
   * Export a plan as JSON
   */
  async exportPlan(planId: string, userId: string): Promise<{
    plan: Plan;
    items: PlanItem[];
    checklist: ChecklistItem[];
  }> {
    const plan = await this.getPlanById(planId, userId);
    if (!plan) {
      throw new AppError('PLAN_NOT_FOUND', 'Plan not found', 404);
    }

    const items = await this.getPlanItems(planId, userId);
    const checklist = await db.query<ChecklistItem>(
      'SELECT * FROM checklist_items WHERE plan_id = $1 ORDER BY position',
      [planId]
    );

    return { plan, items, checklist };
  }
}

export const planService = new PlanService();

