-- Down Migration for 20260824064321_init_schema

-- DropForeignKeys
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_author_id_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_task_id_fkey";
ALTER TABLE "task_assignments" DROP CONSTRAINT IF EXISTS "task_assignments_user_id_fkey";
ALTER TABLE "task_assignments" DROP CONSTRAINT IF EXISTS "task_assignments_task_id_fkey";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_project_id_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_org_id_fkey";
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey";
ALTER TABLE "org_members" DROP CONSTRAINT IF EXISTS "org_members_user_id_fkey";
ALTER TABLE "org_members" DROP CONSTRAINT IF EXISTS "org_members_org_id_fkey";

-- DropIndexes
DROP INDEX IF EXISTS "idx_tasks_search_gin";
DROP INDEX IF EXISTS "idx_outbox_status_created";
DROP INDEX IF EXISTS "idx_comments_task_created";
DROP INDEX IF EXISTS "task_assignments_task_id_user_id_key";
DROP INDEX IF EXISTS "idx_task_assignments_user";
DROP INDEX IF EXISTS "idx_task_assignments_task";
DROP INDEX IF EXISTS "idx_tasks_project_due_date";
DROP INDEX IF EXISTS "idx_tasks_project_priority";
DROP INDEX IF EXISTS "idx_tasks_project_status";
DROP INDEX IF EXISTS "idx_tasks_project_deleted";
DROP INDEX IF EXISTS "idx_projects_org_deleted";
DROP INDEX IF EXISTS "idx_refresh_tokens_user_revoked";
DROP INDEX IF EXISTS "idx_refresh_tokens_hash";
DROP INDEX IF EXISTS "refresh_tokens_token_hash_key";
DROP INDEX IF EXISTS "org_members_org_id_user_id_key";
DROP INDEX IF EXISTS "idx_org_members_org_role";
DROP INDEX IF EXISTS "idx_org_members_user_org";
DROP INDEX IF EXISTS "idx_organizations_slug";
DROP INDEX IF EXISTS "organizations_slug_key";
DROP INDEX IF EXISTS "idx_users_email";
DROP INDEX IF EXISTS "users_email_key";

-- DropTables
DROP TABLE IF EXISTS "outbox_jobs";
DROP TABLE IF EXISTS "comments";
DROP TABLE IF EXISTS "task_assignments";
DROP TABLE IF EXISTS "tasks";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "refresh_tokens";
DROP TABLE IF EXISTS "org_members";
DROP TABLE IF EXISTS "organizations";
DROP TABLE IF EXISTS "users";

-- DropEnums
DROP TYPE IF EXISTS "OutboxStatus";
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
DROP TYPE IF EXISTS "Role";
