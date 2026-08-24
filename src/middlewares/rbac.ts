import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';
import { Role } from '@prisma/client';

/**
 * Role-Based Access Control (RBAC) middleware:
 * Ensures the authenticated user has one of the allowed roles in the active organization context.
 */
export const requireRole = (allowedRoles: (Role | 'org_admin' | 'member')[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authOrg) {
      return next(new UnauthorizedError('Authentication and organization context required', 'AUTH_CONTEXT_MISSING'));
    }

    if (!allowedRoles.includes(req.authOrg.role)) {
      return next(
        new ForbiddenError(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role is '${req.authOrg.role}'.`,
          'INSUFFICIENT_PERMISSIONS',
          { requiredRoles: allowedRoles, currentRole: req.authOrg.role }
        )
      );
    }

    next();
  };
};
