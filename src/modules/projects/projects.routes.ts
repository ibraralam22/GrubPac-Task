import { Router } from 'express';
import { projectsController } from './projects.controller';
import { authenticate } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/rbac';
import { validateRequest } from '../../middlewares/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  listProjectsSchema,
} from './projects.schema';

const router = Router();

// All project routes require authentication and valid org context
router.use(authenticate);

router.post('/', validateRequest(createProjectSchema), projectsController.create);
router.get('/', validateRequest(listProjectsSchema), projectsController.list);
router.get('/:id', validateRequest(projectIdParamSchema), projectsController.getById);
router.patch('/:id', validateRequest(updateProjectSchema), projectsController.update);
router.put('/:id', validateRequest(updateProjectSchema), projectsController.update);

// Project deletion restricted strictly to org_admin
router.delete('/:id', requireRole(['org_admin']), validateRequest(projectIdParamSchema), projectsController.delete);

// Project dashboard metrics
router.get('/:id/dashboard', validateRequest(projectIdParamSchema), projectsController.dashboard);

export const projectsRouter = router;
