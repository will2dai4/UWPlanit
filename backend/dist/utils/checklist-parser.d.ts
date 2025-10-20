/**
 * Parsed checklist item structure
 */
export interface ParsedChecklistItem {
    label: string;
    is_done: boolean;
    group_key?: string;
    required_count?: number;
    children?: ParsedChecklistItem[];
    position: number;
}
/**
 * Parse text into a structured checklist
 * Supports:
 * - Simple lines become items
 * - Indentation creates nesting (2 spaces or 1 tab)
 * - [ ] or [x] for checkbox state
 * - "Choose N of M:" creates group with required_count
 */
export declare const parseChecklistText: (text: string) => ParsedChecklistItem[];
/**
 * Flatten nested checklist items for database insertion
 * Returns items with parent_id references
 */
export declare const flattenChecklistItems: (items: ParsedChecklistItem[], planId: string, parentId?: string | null) => Array<{
    label: string;
    is_done: boolean;
    group_key?: string;
    required_count?: number;
    parent_id: string | null;
    position: number;
    tempId: string;
}>;
//# sourceMappingURL=checklist-parser.d.ts.map