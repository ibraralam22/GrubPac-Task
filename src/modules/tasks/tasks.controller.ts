import { Request, Response, NextFunction } from 'express';
import { tasksService, TasksService } from './tasks.service';

export class TasksController {
  constructor(private readonly service: TasksService = tasksService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const task = await this.service.createTask(orgId, req.body);
      res.status(201).json({
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const result = await this.service.listTasks(orgId, req.query as any);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const task = await this.service.getTaskById(req.params.id as string, orgId);
      res.status(200).json({
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const task = await this.service.updateTask(req.params.id as string, orgId, req.body);
      res.status(200).json({
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const result = await this.service.deleteTask(req.params.id as string, orgId);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const result = await this.service.bulkUpdateStatus(orgId, req.body);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const orgName = req.authOrg!.name;
      const assignedByUser = {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
      };

      const result = await this.service.assignTask(
        req.params.id as string,
        req.body.userId,
        assignedByUser,
        orgId,
        orgName
      );

      res.status(200).json({
        data: result.assignment,
        job: result.job,
      });
    } catch (error) {
      next(error);
    }
  };

  unassign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const userId = (req.body.userId || req.params.userId) as string;
      const result = await this.service.unassignTask(req.params.id as string, userId, orgId);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const tasksController = new TasksController();
