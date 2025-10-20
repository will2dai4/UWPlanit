"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenChecklistItems = exports.parseChecklistText = void 0;
/**
 * Parse text into a structured checklist
 * Supports:
 * - Simple lines become items
 * - Indentation creates nesting (2 spaces or 1 tab)
 * - [ ] or [x] for checkbox state
 * - "Choose N of M:" creates group with required_count
 */
const parseChecklistText = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const result = [];
    const stack = [];
    lines.forEach((line, index) => {
        // Calculate indentation level
        const match = line.match(/^(\s*)/);
        const indent = match ? match[1].length : 0;
        // Remove leading whitespace
        let content = line.trim();
        // Check for checkbox markers
        let isDone = false;
        if (content.startsWith('[x]') || content.startsWith('[X]')) {
            isDone = true;
            content = content.substring(3).trim();
        }
        else if (content.startsWith('[ ]')) {
            content = content.substring(3).trim();
        }
        else if (content.startsWith('- ')) {
            content = content.substring(2).trim();
        }
        // Check for "Choose N of M" pattern
        const chooseMatch = content.match(/^choose\s+(\d+)\s+of\s+(\d+):?\s*(.*)/i);
        let requiredCount;
        let groupKey;
        if (chooseMatch) {
            requiredCount = parseInt(chooseMatch[1], 10);
            groupKey = content;
            content = chooseMatch[3] || content;
        }
        const item = {
            label: content,
            is_done: isDone,
            position: index,
            ...(groupKey && { group_key: groupKey }),
            ...(requiredCount && { required_count: requiredCount }),
        };
        // Pop stack until we find the right parent level
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }
        if (stack.length === 0) {
            // Top-level item
            result.push(item);
        }
        else {
            // Nested item
            const parent = stack[stack.length - 1].item;
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(item);
        }
        // Add to stack for potential children
        stack.push({ item, indent });
    });
    return result;
};
exports.parseChecklistText = parseChecklistText;
/**
 * Flatten nested checklist items for database insertion
 * Returns items with parent_id references
 */
const flattenChecklistItems = (items, planId, parentId = null) => {
    const flattened = [];
    items.forEach((item, index) => {
        const tempId = `temp-${Date.now()}-${index}`;
        flattened.push({
            label: item.label,
            is_done: item.is_done,
            group_key: item.group_key,
            required_count: item.required_count,
            parent_id: parentId,
            position: item.position,
            tempId,
        });
        if (item.children && item.children.length > 0) {
            // Recursively flatten children - they'll use this item's tempId as parent
            // Note: In actual implementation, you'd need to handle this with a two-pass
            // approach where you insert parents first, get their IDs, then insert children
            const childItems = (0, exports.flattenChecklistItems)(item.children, planId, tempId);
            flattened.push(...childItems);
        }
    });
    return flattened;
};
exports.flattenChecklistItems = flattenChecklistItems;
//# sourceMappingURL=checklist-parser.js.map