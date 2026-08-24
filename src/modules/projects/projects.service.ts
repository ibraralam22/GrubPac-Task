import { projectsRepository, ProjectsRepository } from './projects.repository';
import { CreateProjectInput, UpdateProjectInput } from './projects.schema';
import { NotFoundError, ForbiddenError } from '../../errors/AppError';
import { calculatePagination, buildOffsetPaginationResponse } from '../../utils/pagination';

export class ProjectsService {
  constructor(private readonly repo: ProjectsRepository = projectsRepository) {}

  async createProject(orgId: string, input: CreateProjectInput) {
    return this.repo.create({
      orgId,
      name: input.name,
      description: input.description,
    });
  }

  async listProjects(orgId: string, query: { page?: number; limit?: number; search?: string; includeDeleted?: string }) {
    const { page, limit, skip } = calculatePagination(query.page, query.limit);
    const includeDeleted = query.includeDeleted === 'true';

    const { data, total } = await this.repo.findMany({
      orgId,
      skip,
      limit,
      search: query.search,
      includeDeleted,
    });

    return buildOffsetPaginationResponse(data, total, page, limit);
  }

  async getProjectById(id: string, orgId: string) {
    // Check if the project exists anywhere in the database to distinguish between 404 and cross-tenant 403
    const projectGlobal = await this.repo.findById(id, undefined, true);
    if (!projectGlobal) {
      throw new NotFoundError(`Project with ID '${id}' was not found`, 'PROJECT_NOT_FOUND', { projectId: id });
    }

    if (projectGlobal.orgId !== orgId) {
      throw new ForbiddenError(
        'Cross-tenant access forbidden: Project belongs to a different organization',
        'CROSS_TENANT_ACCESS_FORBIDDEN'
      );
    }

    if (projectGlobal.deletedAt) {
      throw new NotFoundError(`Project with ID '${id}' has been deleted`, 'PROJECT_DELETED', { projectId: id });
    }

    return projectGlobal;
  }

  async updateProject(id: string, orgId: string, input: UpdateProjectInput) {
    await this.getProjectById(id, orgId); // Enforces existence and tenant isolation

    await this.repo.update(id, orgId, input);
    return this.repo.findById(id, orgId);
  }

  async deleteProject(id: string, orgId: string) {
    await this.getProjectById(id, orgId); // Enforces existence and tenant isolation

    await this.repo.softDelete(id, orgId);
    return { success: true, message: 'Project soft-deleted successfully', projectId: id };
  }

  async getProjectDashboard(id: string, orgId: string) {
    await this.getProjectById(id, orgId); // Enforces existence and tenant isolation

    const stats = await this.repo.getDashboardStats(id, orgId);
    return stats;
  }
}

export const projectsService = new ProjectsService();
