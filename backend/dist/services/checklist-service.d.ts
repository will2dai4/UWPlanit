import { ChecklistItem } from '../types';
import { ParsedChecklistItem } from '../utils/checklist-parser';
export declare class ChecklistService {
    /**
     * Get all checklist items for a plan
     */
    getChecklistItems(planId: string, userId: string): Promise<ChecklistItem[]>;
    /**
     * Create a checklist item
     */
    createChecklistItem(planId: string, userId: string, data: {
        label: string;
        group_key?: string;
        required_count?: number;
        parent_id?: string;
        position?: number;
    }): Promise<ChecklistItem>;
    /**
     * Update a checklist item
     */
    updateChecklistItem(itemId: string, planId: string, userId: string, updates: {
        label?: string;
        is_done?: boolean;
        group_key?: string;
        required_count?: number;
        position?: number;
    }): Promise<ChecklistItem>;
    /**
     * Delete a checklist item
     */
    deleteChecklistItem(itemId: string, planId: string, userId: string): Promise<void>;
    /**
     * Parse text into checklist items (returns parsed structure, doesn't save)
     */
    parseText(text: string): ParsedChecklistItem[];
    /**
     * Create checklist items from parsed text
     */
    createFromParsedItems(planId: string, userId: string, items: ParsedChecklistItem[]): Promise<ChecklistItem[]>;
}
export declare const checklistService: ChecklistService;
//# sourceMappingURL=checklist-service.d.ts.map