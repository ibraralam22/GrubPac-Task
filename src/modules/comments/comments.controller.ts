import { Request, Response, NextFunction } from 'express';
import { commentsService, CommentsService } from './comments.service';

export class CommentsController {
  constructor(private readonly service: CommentsService = commentsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const authorId = req.user!.id;
      const taskId = (req.params.taskId || req.params.id) as string;

      const comment = await this.service.createComment(taskId, authorId, orgId, req.body);
      res.status(201).json({
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const taskId = (req.params.taskId || req.params.id) as string;

      const comments = await this.service.listComments(taskId, orgId);
      res.status(200).json({
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const commentsController = new CommentsController();
