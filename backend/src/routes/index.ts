import { Router } from 'express';
import coursesRouter from './courses';
import graphRouter from './graph';
import plansRouter from './plans';
import checklistRouter from './checklist';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/courses', coursesRouter);
router.use('/graph', graphRouter);
router.use('/plans', plansRouter);

// Checklist routes are nested under plans
// but we also support them at the top level for convenience
router.use('/plans', checklistRouter);

export default router;

