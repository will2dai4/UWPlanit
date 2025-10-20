"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseNodeId = exports.buildGraphElements = void 0;
/**
 * Build VISX graph elements from courses and relations
 */
const buildGraphElements = (courses, relations) => {
    const nodes = courses.map(course => ({
        id: course.course_id,
        label: `${course.subject} ${course.catalog_number}`,
        subject: course.subject,
        catalog_number: course.catalog_number,
        title: course.title || undefined,
        units: course.units || undefined,
        level: course.level || undefined,
        faculty: course.faculty || undefined,
    }));
    const edges = relations.map(relation => ({
        id: `${relation.source_course_id}->${relation.target_course_id}`,
        source: relation.source_course_id,
        target: relation.target_course_id,
        rtype: relation.rtype,
        note: relation.note || undefined,
    }));
    return { nodes, edges };
};
exports.buildGraphElements = buildGraphElements;
/**
 * Get node IDs from a course code (subject + catalog_number)
 */
const getCourseNodeId = (subject, catalogNumber) => {
    return `${subject}${catalogNumber}`;
};
exports.getCourseNodeId = getCourseNodeId;
//# sourceMappingURL=graph-builder.js.map