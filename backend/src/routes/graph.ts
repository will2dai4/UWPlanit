import { Router } from 'express';
import { courseService } from '../services/course-service';
import { z } from 'zod';

const router = Router();

/**
 * GET /api/v1/graph/global
 * Get the global course graph (all courses and relations)
 */
router.get('/global', async (req, res, next) => {
  try {
    const elements = await courseService.getGlobalGraph();

    res.set('Cache-Control', 'public, max-age=43200'); // 12 hours
    res.json({
      data: elements,
      meta: {
        nodes: elements.nodes.length,
        edges: elements.edges.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/graph/subject/:subject
 * Get graph for a specific subject
 */
router.get('/subject/:subject', async (req, res, next) => {
  try {
    const subjectSchema = z.string().regex(/^[A-Z]{2,10}$/i);
    const subject = subjectSchema.parse(req.params.subject);

    const elements = await courseService.getSubjectGraph(subject);

    res.set('Cache-Control', 'public, max-age=43200'); // 12 hours
    res.json({
      data: elements,
      meta: {
        subject: subject.toUpperCase(),
        nodes: elements.nodes.length,
        edges: elements.edges.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

