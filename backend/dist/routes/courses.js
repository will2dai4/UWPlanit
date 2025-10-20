"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_service_1 = require("../services/course-service");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/courses
 * Search courses with filters
 */
router.get('/', async (req, res, next) => {
    try {
        const params = validators_1.courseSearchSchema.parse(req.query);
        const result = await course_service_1.courseService.searchCourses(params);
        res.json({
            data: result.courses,
            meta: {
                total: result.total,
                limit: params.limit,
                offset: params.offset,
                hasMore: result.total > params.offset + params.limit,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/courses/:course_id
 * Get a specific course by ID
 */
router.get('/:course_id', async (req, res, next) => {
    try {
        const { course_id } = req.params;
        validators_1.uuidSchema.parse(course_id);
        const course = await course_service_1.courseService.getCourseById(course_id);
        if (!course) {
            res.status(404).json({
                error: {
                    code: 'COURSE_NOT_FOUND',
                    message: 'Course not found',
                },
            });
            return;
        }
        // Get relations for this course
        const relations = await course_service_1.courseService.getCourseRelations(course_id);
        res.json({
            data: {
                ...course,
                relations,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map