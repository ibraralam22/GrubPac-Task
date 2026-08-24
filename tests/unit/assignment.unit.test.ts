import { describe, it, expect } from 'vitest';
import { ForbiddenError } from '../../src/errors/AppError';

describe('Unit Tests: Task Assignment Domain Logic', () => {
  // Helper simulating the organization boundary verification rule
  function validateAssignmentMembership(taskOrgId: string, assigneeOrgId: string) {
    if (taskOrgId !== assigneeOrgId) {
      throw new ForbiddenError(
        'The assigned user must belong to the same organization as the task',
        'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'
      );
    }
    return true;
  }

  it('should accept assignment when user and task belong to the same organization', () => {
    const orgAcme = '9dff4104-c3b0-4a8b-9544-093fcfa897ed';
    expect(validateAssignmentMembership(orgAcme, orgAcme)).toBe(true);
  });

  it('should reject assignment and throw ForbiddenError when user belongs to another organization', () => {
    const orgAcme = '9dff4104-c3b0-4a8b-9544-093fcfa897ed';
    const orgGlobex = '11111111-2222-3333-4444-555555555555';

    expect(() => validateAssignmentMembership(orgAcme, orgGlobex)).toThrowError(ForbiddenError);
    try {
      validateAssignmentMembership(orgAcme, orgGlobex);
    } catch (err: any) {
      expect(err.code).toBe('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
    }
  });
});
