import { Router } from 'express';
import { courseService } from '../services/course-service';
import { courseSearchSchema, uuidSchema } from '../utils/validators';

const router = Router();

/**
 * GET /api/v1/courses
 * Search courses with filters
 */
router.get('/', async (req, res, next) => {
  try {
    const params = courseSearchSchema.parse(req.query);
    
    const result = await courseService.searchCourses(params);

    res.json({
      data: result.courses,
      meta: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: result.total > params.offset + params.limit,
      },
    });
  } catch (error) {
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
    uuidSchema.parse(course_id);

    const course = await courseService.getCourseById(course_id);

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
    const relations = await courseService.getCourseRelations(course_id);

    res.json({
      data: {
        ...course,
        relations,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

