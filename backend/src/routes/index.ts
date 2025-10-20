import { Router } from 'express';
import coursesRouter from './courses';
import graphRouter from './graph';
import plansRouter from './plans';
import checklistRouter from './checklist';
import adminRouter from './admin';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
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

// Admin routes (ETL, maintenance, etc.)
router.use('/admin', adminRouter);

export default router;

