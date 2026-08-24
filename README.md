# TaskFlow — Multi-Tenant Project Management Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.41-orange.svg)](https://bullmq.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-teal.svg)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-35%20Passed-brightgreen.svg)]()

TaskFlow is a production-grade, multi-tenant project management backend built with Node.js, TypeScript, Express, PostgreSQL, Redis, and BullMQ. It demonstrates secure organization-level isolation, role-based access control (RBAC), database design with full-text search, resilient background job processing with dead-letter queueing (DLQ), comprehensive automated tests, interactive Swagger UI, and Docker Compose orchestration.

---

## 🌟 Key Highlights & Features

- 🏢 **Multi-Tenant Isolation**: Strict organization scoping on every query. Attempts to access cross-tenant resources return `403 Forbidden` without leaking resource existence.
- 🔐 **Authentication & RBAC**:
  - `bcrypt` password hashing with cost factor $\ge 12$.
  - Short-lived JWT Access Tokens (15 min) + Database-persisted Refresh Tokens (7 days).
  - Refresh token rotation with reuse compromise detection.
  - Role-based authorization (`org_admin` vs `member`).
  - Rate limiting on auth endpoints (10 req/min/IP).
- 📁 **Projects & Tasks REST API**:
  - Clean layered architecture (**Route $\to$ Controller $\to$ Service $\to$ Repository**).
  - Zod validation for request body, query, and params.
  - Standardized JSON error response format: `{ error, code, details }`.
  - Offset pagination (`{ data, total, page, limit }`) and cursor pagination (`{ data, next_cursor }`).
  - Filtering by status, priority, assignee, due date range, and project.
  - **★ PostgreSQL Full-Text Search**: Sub-millisecond text search on task title and description using GIN index.
  - **★ Soft Delete**: `deleted_at` timestamps on projects and tasks.
  - **★ Bulk Status Update**: Atomic update across multiple tasks (`PATCH /tasks/bulk-status`).
  - Project Dashboard with task distribution metrics grouped by status and priority.
- ⚡ **Background Jobs & BullMQ Worker**:
  - Asynchronous email notification triggered on task assignment.
  - **Transactional Outbox Consistency Strategy**: Atomically records assignments and outbox events in PostgreSQL to prevent data inconsistencies.
  - Exponential backoff retry policy: 3 attempts ($1\text{s} \to 2\text{s} \to 4\text{s}$).
  - **Dead-Letter Queue (DLQ)**: Automatically moves exhausted jobs to `email-notifications-dlq` and reports status as `failed`.
  - **★ Deduplication**: 5-second assignment debounce window.
  - **★ Rate Limiter**: 50 emails / minute global queue rate limiter.
  - Real-time Job Status endpoint: `GET /jobs/:id` (`pending`, `active`, `completed`, `failed`).
- 🧪 **Automated Testing Suite**: 35 unit and integration tests with test DB isolation, queue job verification, and V8 code coverage report.
- 📚 **Interactive Documentation**: Swagger UI at `/docs`, OpenAPI 3.0 specification (`docs/openapi.yaml`), ready-to-use Postman collection, and Bruno collection.

---

## 🏗️ Architecture

For deep-dive documentation on database modeling, ERD, foreign key CASCADE decisions, indexing justifications, and queue consistency, read [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 👥 Seed Test Accounts & Credentials

The database comes pre-populated with **2 Organizations**, **5 Users**, **5 Projects**, **15 Tasks**, and sample comments. All test accounts use the password: `Password123!`

| Email | Role | Organization | Description |
| :--- | :--- | :--- | :--- |
| `admin1@acme.com` | `org_admin` | **Acme Dynamics** | Primary Administrator for Acme |
| `member1@acme.com` | `member` | **Acme Dynamics** | Team Member at Acme |
| `member2@acme.com` | `member` | **Acme Dynamics** | Team Member at Acme |
| `admin2@globex.com` | `org_admin` | **Globex Solutions** | Administrator for Globex |
| `member3@globex.com` | `member` | **Globex Solutions** | Team Member at Globex |

---

## 🚀 Quick Start with Docker Compose

To start the entire stack (**PostgreSQL**, **Redis**, **API Server**, and **Background Worker**) in isolated containers:

```bash
# 1. Clone the repository
git clone git@github.com:ibraralam22/GrubPac-Task.git
cd GrubPac-Task

# 2. Start all services in the background
docker compose up --build -d

# 3. Apply migrations and seed the database inside the container
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

The API will be accessible at:
- **API Base URL**: `http://localhost:3000`
- **Swagger UI Interactive Docs**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`

To stop the containers:
```bash
docker compose down
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v20+
- **PostgreSQL**: 15 or 16
- **Redis**: 7+

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migrations & Seeding
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npm run prisma:migrate

# Seed 2 orgs, 5 users, 5 projects, 15 tasks
npm run prisma:seed
```

### 5. Start the Application
Open two terminal tabs:

**Terminal 1 (API Server):**
```bash
npm run dev
```

**Terminal 2 (Background Worker):**
```bash
npm run dev:worker
```

---

## 📚 API Documentation & Postman / Bruno Collections

### 1. Interactive Swagger UI
Open your browser at `http://localhost:3000/docs` to interactively execute endpoints directly with JWT authorization.

### 2. Postman Collection
Import the collection located at:
```
docs/TaskFlow.postman_collection.json
```
- **Auto-Token Capture**: Executing `1. Login (Acme Admin)` automatically saves the JWT access token and refresh token to collection variables. All subsequent requests work immediately without manual token copy-pasting.

### 3. Bruno Collection
Bruno API definitions are located in `docs/bruno/`. Open the directory in Bruno to run requests.

---

## 📡 REST Endpoints Reference

### Authentication (`/auth`) — Rate limited to 10 req/min/IP
- `POST /auth/register` - Register user & create organization
- `POST /auth/login` - Authenticate and retrieve JWT & refresh tokens
- `POST /auth/refresh` - Rotate and issue new access & refresh tokens
- `POST /auth/logout` - Revoke refresh token
- `POST /auth/logout-all` - Revoke all active user sessions across all devices
- `GET /auth/me` - Get current user profile and active organization context

### Projects (`/projects`)
- `POST /projects` - Create project in active organization
- `GET /projects` - List organization projects (paginated)
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project details
- `DELETE /projects/:id` - Soft delete project (`org_admin` only)
- `GET /projects/:id/dashboard` - Project dashboard with task status & priority counts

### Tasks (`/tasks`)
- `POST /tasks` - Create task inside a project
- `GET /tasks` - Search & filter tasks:
  - `status`: `todo`, `in_progress`, `review`, `done`
  - `priority`: `low`, `medium`, `high`, `urgent`
  - `assignee`: User UUID
  - `due_from` & `due_to`: Date range
  - `q`: Full-Text Search keyword
  - `paginationType`: `offset` (default) or `cursor`
  - `page`, `limit`, `cursor`
- `GET /tasks/:id` - Get task details with assignees and comments
- `PATCH /tasks/:id` - Update task details
- `DELETE /tasks/:id` - Soft delete task
- `PATCH /tasks/bulk-status` - Bulk update status for multiple task IDs

### Task Assignments & Comments
- `POST /tasks/:id/assign` - Assign user to task (validates same org & enqueues BullMQ email job)
- `POST /tasks/:id/unassign` - Unassign user from task
- `GET /tasks/:taskId/comments` - List comments for task
- `POST /tasks/:taskId/comments` - Add comment to task

### Background Jobs (`/jobs`)
- `GET /jobs/:id` - Check status of BullMQ job (`pending`, `active`, `completed`, `failed`)

---

## 🧪 Automated Testing

TaskFlow includes comprehensive unit and integration tests covering authentication, tenant isolation, CRUD, pagination, and queue jobs:

```bash
# Run test suite
npm test

# Run tests with code coverage report
npm run test:coverage

# Run TypeScript type check
npm run typecheck
```

### Test Coverage Summary
- **Unit Tests**: Password hashing cost $\ge 12$, JWT token verification, token expiration, pagination calculation, same-org validation.
- **Integration Tests**: Login flow, token rotation & reuse detection, project CRUD, task CRUD, full-text search, cross-tenant 403 prevention, and queue job dispatch.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | HTTP Server port |
| `NODE_ENV` | `development` | Environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `JWT_ACCESS_SECRET` | - | Secret key for signing 15-min access tokens |
| `JWT_ACCESS_EXPIRES_IN`| `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | - | Secret key for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN`| `7d` | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | `12` | bcrypt cost factor (must be $\ge 12$) |
| `RATE_LIMIT_MAX_AUTH` | `10` | Max auth requests per minute per IP |
