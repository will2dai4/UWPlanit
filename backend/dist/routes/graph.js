"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_service_1 = require("../services/course-service");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/graph/global
 * Get the global course graph (all courses and relations)
 */
router.get('/global', async (_req, res, next) => {
    try {
        const elements = await course_service_1.courseService.getGlobalGraph();
        res.set('Cache-Control', 'public, max-age=43200'); // 12 hours
        res.json({
            data: elements,
            meta: {
                nodes: elements.nodes.length,
                edges: elements.edges.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/graph/subject/:subject
 * Get graph for a specific subject
 */
router.get('/subject/:subject', async (req, res, next) => {
    try {
        const subjectSchema = zod_1.z.string().regex(/^[A-Z]{2,10}$/i);
        const subject = subjectSchema.parse(req.params.subject);
        const elements = await course_service_1.courseService.getSubjectGraph(subject);
        res.set('Cache-Control', 'public, max-age=43200'); // 12 hours
        res.json({
            data: elements,
            meta: {
                subject: subject.toUpperCase(),
                nodes: elements.nodes.length,
                edges: elements.edges.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=graph.js.map