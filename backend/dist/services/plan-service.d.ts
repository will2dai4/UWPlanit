import { Plan, PlanItem, ChecklistItem } from '../types';
export declare class PlanService {
    /**
     * Get all plans for a user
     */
    getUserPlans(userId: string): Promise<Plan[]>;
    /**
     * Get a plan by ID
     */
    getPlanById(planId: string, userId: string): Promise<Plan | null>;
    /**
     * Create a new plan
     */
    createPlan(userId: string, name: string): Promise<Plan>;
    /**
     * Update a plan
     */
    updatePlan(planId: string, userId: string, updates: {
        name?: string;
        is_public?: boolean;
    }): Promise<Plan>;
    /**
     * Delete a plan
     */
    deletePlan(planId: string, userId: string): Promise<void>;
    /**
     * Get all items in a plan
     */
    getPlanItems(planId: string, userId: string): Promise<PlanItem[]>;
    /**
     * Add an item to a plan
     */
    addPlanItem(planId: string, userId: string, data: {
        course_id: string;
        term?: string;
        pos_x?: number;
        pos_y?: number;
    }): Promise<PlanItem>;
    /**
     * Update a plan item
     */
    updatePlanItem(planItemId: string, planId: string, userId: string, updates: {
        term?: string;
        pos_x?: number;
        pos_y?: number;
    }): Promise<PlanItem>;
    /**
     * Delete a plan item
     */
    deletePlanItem(planItemId: string, planId: string, userId: string): Promise<void>;
    /**
     * Export a plan as JSON
     */
    exportPlan(planId: string, userId: string): Promise<{
        plan: Plan;
        items: PlanItem[];
        checklist: ChecklistItem[];
    }>;
}
export declare const planService: PlanService;
//# sourceMappingURL=plan-service.d.ts.map