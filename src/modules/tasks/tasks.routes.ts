import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  listTasksSchema,
  assignTaskSchema,
  unassignTaskSchema,
  bulkTaskStatusSchema,
} from './tasks.schema';

const router = Router();

// All task routes require authentication and organization context
router.use(authenticate);

// Bulk status update (must be placed before /:id)
router.patch('/bulk-status', validateRequest(bulkTaskStatusSchema), tasksController.bulkStatus);

router.post('/', validateRequest(createTaskSchema), tasksController.create);
router.get('/', validateRequest(listTasksSchema), tasksController.list);
router.get('/:id', validateRequest(taskIdParamSchema), tasksController.getById);
router.patch('/:id', validateRequest(updateTaskSchema), tasksController.update);
router.put('/:id', validateRequest(updateTaskSchema), tasksController.update);
router.delete('/:id', validateRequest(taskIdParamSchema), tasksController.delete);

// Task Assignments
router.post('/:id/assign', validateRequest(assignTaskSchema), tasksController.assign);
router.post('/:id/unassign', validateRequest(unassignTaskSchema), tasksController.unassign);
router.delete('/:id/assign/:userId', tasksController.unassign);

export const tasksRouter = router;
