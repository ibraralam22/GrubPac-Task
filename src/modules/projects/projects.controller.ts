import { Request, Response, NextFunction } from 'express';
import { projectsService, ProjectsService } from './projects.service';

export class ProjectsController {
  constructor(private readonly service: ProjectsService = projectsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const project = await this.service.createProject(orgId, req.body);
      res.status(201).json({
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const result = await this.service.listProjects(orgId, req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const project = await this.service.getProjectById(req.params.id as string, orgId);
      res.status(200).json({
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const project = await this.service.updateProject(req.params.id as string, orgId, req.body);
      res.status(200).json({
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const result = await this.service.deleteProject(req.params.id as string, orgId);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = req.authOrg!.orgId;
      const stats = await this.service.getProjectDashboard(req.params.id as string, orgId);
      res.status(200).json({
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const projectsController = new ProjectsController();
