import { Router } from 'express';
import { jobsController } from './jobs.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Protected job status endpoint
router.get('/:id', authenticate, jobsController.getJobStatus);

export const jobsRouter = router;
