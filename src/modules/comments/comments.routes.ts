import { Router } from 'express';
import { commentsController } from './comments.controller';
import { authenticate } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validate';
import { createCommentSchema, listCommentsSchema } from './comments.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validateRequest(createCommentSchema), commentsController.create);
router.get('/', validateRequest(listCommentsSchema), commentsController.list);

export const commentsRouter = router;
