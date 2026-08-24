import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data in reverse relation order
  await prisma.outboxJob.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing database records purged.');

  // Common password hash for test users with bcrypt salt cost 12
  const passwordHash = await bcrypt.hash('Password123!', 12);

  // 1. Create Organizations
  const orgAcme = await prisma.organization.create({
    data: {
      name: 'Acme Dynamics',
      slug: 'acme-dynamics',
    },
  });

  const orgGlobex = await prisma.organization.create({
    data: {
      name: 'Globex Solutions',
      slug: 'globex-solutions',
    },
  });

  console.log('🏢 Created 2 Organizations: Acme Dynamics, Globex Solutions');

  // 2. Create 5 Users
  const userAdmin1 = await prisma.user.create({
    data: {
      email: 'admin1@acme.com',
      passwordHash,
      name: 'Alice Johnson (Admin)',
    },
  });

  const userMember1 = await prisma.user.create({
    data: {
      email: 'member1@acme.com',
      passwordHash,
      name: 'Bob Smith',
    },
  });

  const userMember2 = await prisma.user.create({
    data: {
      email: 'member2@acme.com',
      passwordHash,
      name: 'Charlie Brown',
    },
  });

  const userAdmin2 = await prisma.user.create({
    data: {
      email: 'admin2@globex.com',
      passwordHash,
      name: 'Diana Prince (Admin)',
    },
  });

  const userMember3 = await prisma.user.create({
    data: {
      email: 'member3@globex.com',
      passwordHash,
      name: 'Evan Wright',
    },
  });

  console.log('👤 Created 5 Users (admin1, member1, member2, admin2, member3)');

  // 3. Assign Org Memberships with RBAC Roles
  await prisma.orgMember.createMany({
    data: [
      { orgId: orgAcme.id, userId: userAdmin1.id, role: Role.org_admin },
      { orgId: orgAcme.id, userId: userMember1.id, role: Role.member },
      { orgId: orgAcme.id, userId: userMember2.id, role: Role.member },
      { orgId: orgGlobex.id, userId: userAdmin2.id, role: Role.org_admin },
      { orgId: orgGlobex.id, userId: userMember3.id, role: Role.member },
    ],
  });

  console.log('🛡️ Assigned Org Memberships & RBAC Roles');

  // 4. Create Projects
  const projWebsite = await prisma.project.create({
    data: {
      orgId: orgAcme.id,
      name: 'Website Redesign 2026',
      description: 'Modernizing corporate web application with high performance and accessibility',
    },
  });

  const projMobile = await prisma.project.create({
    data: {
      orgId: orgAcme.id,
      name: 'Mobile App v2.0',
      description: 'Cross-platform mobile application for customer task management',
    },
  });

  const projInfra = await prisma.project.create({
    data: {
      orgId: orgAcme.id,
      name: 'Core Infrastructure & DevOps',
      description: 'Kubernetes cluster automation and CI/CD pipelines',
    },
  });

  const projCloud = await prisma.project.create({
    data: {
      orgId: orgGlobex.id,
      name: 'Cloud Migration Initiative',
      description: 'Migration of database and microservices from on-prem to AWS',
    },
  });

  const projPortal = await prisma.project.create({
    data: {
      orgId: orgGlobex.id,
      name: 'Enterprise Customer Portal',
      description: 'Self-service analytics and billing portal for B2B enterprise clients',
    },
  });

  console.log('📁 Created 5 Projects across Acme Dynamics & Globex Solutions');

  // 5. Create 15+ Tasks with distributed statuses and priorities
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Acme Project 1 Tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: projWebsite.id,
      title: 'Design Landing Page Hero and Typography',
      description: 'Create high-converting landing page Figma mockups and responsive design tokens',
      status: TaskStatus.done,
      priority: TaskPriority.high,
      dueDate: pastDate,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: projWebsite.id,
      title: 'Implement Dark Mode and CSS Theme Variables',
      description: 'Support automatic system dark mode detection and smooth color transitions',
      status: TaskStatus.in_progress,
      priority: TaskPriority.medium,
      dueDate: nextWeek,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: projWebsite.id,
      title: 'Setup Google Analytics and Meta Tracking',
      description: 'Configure cookie banner and privacy-compliant analytics events',
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      dueDate: twoWeeks,
    },
  });

  // Acme Project 2 Tasks
  const task4 = await prisma.task.create({
    data: {
      projectId: projMobile.id,
      title: 'Integrate Biometric FaceID / TouchID Authentication',
      description: 'Allow users to quickly authenticate using native device security hardware',
      status: TaskStatus.in_progress,
      priority: TaskPriority.urgent,
      dueDate: nextWeek,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: projMobile.id,
      title: 'Push Notification Service Setup with APNs and FCM',
      description: 'Send instant push updates on task assignment and comment mentions',
      status: TaskStatus.review,
      priority: TaskPriority.high,
      dueDate: nextWeek,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: projMobile.id,
      title: 'Offline Sync and SQLite Local Cache',
      description: 'Persist state locally and sync seamlessly when network reconnects',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: twoWeeks,
    },
  });

  // Acme Project 3 Tasks
  const task7 = await prisma.task.create({
    data: {
      projectId: projInfra.id,
      title: 'Provision Production Redis Cluster',
      description: 'High availability Redis with automated failover and encryption in transit',
      status: TaskStatus.done,
      priority: TaskPriority.urgent,
      dueDate: pastDate,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: projInfra.id,
      title: 'Automate Database Backup and Point-in-Time Recovery',
      description: 'Configure automated daily S3 snapshots with 30-day retention policies',
      status: TaskStatus.in_progress,
      priority: TaskPriority.high,
      dueDate: nextWeek,
    },
  });

  const task9 = await prisma.task.create({
    data: {
      projectId: projInfra.id,
      title: 'Setup Prometheus Metrics & Grafana Dashboard',
      description: 'Monitor API latency, throughput, error rates, and queue worker health',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: twoWeeks,
    },
  });

  // Globex Project 4 Tasks
  const task10 = await prisma.task.create({
    data: {
      projectId: projCloud.id,
      title: 'Schema Assessment and PostgreSQL 16 Target Setup',
      description: 'Analyze legacy stored procedures and migrate constraints to PostgreSQL',
      status: TaskStatus.done,
      priority: TaskPriority.urgent,
      dueDate: pastDate,
    },
  });

  const task11 = await prisma.task.create({
    data: {
      projectId: projCloud.id,
      title: 'Migrate Legacy User Accounts and Hash Verification',
      description: 'Validate bcrypt hash compatibility across legacy user table',
      status: TaskStatus.review,
      priority: TaskPriority.high,
      dueDate: nextWeek,
    },
  });

  const task12 = await prisma.task.create({
    data: {
      projectId: projCloud.id,
      title: 'Conduct Load and Stress Testing with K6',
      description: 'Simulate 5,000 concurrent users to verify query response times under 50ms',
      status: TaskStatus.todo,
      priority: TaskPriority.medium,
      dueDate: twoWeeks,
    },
  });

  // Globex Project 5 Tasks
  const task13 = await prisma.task.create({
    data: {
      projectId: projPortal.id,
      title: 'Implement Stripe Invoicing & Usage-Based Billing',
      description: 'Webhook integration for automated seat subscriptions and tax calculation',
      status: TaskStatus.in_progress,
      priority: TaskPriority.urgent,
      dueDate: nextWeek,
    },
  });

  const task14 = await prisma.task.create({
    data: {
      projectId: projPortal.id,
      title: 'Build SSO Login with SAML / Okta',
      description: 'Enterprise single sign-on integration for corporate workspaces',
      status: TaskStatus.todo,
      priority: TaskPriority.high,
      dueDate: twoWeeks,
    },
  });

  const task15 = await prisma.task.create({
    data: {
      projectId: projPortal.id,
      title: 'Audit Logging System for Compliance',
      description: 'Store immutable audit trails of all user permission and configuration edits',
      status: TaskStatus.todo,
      priority: TaskPriority.low,
      dueDate: twoWeeks,
    },
  });

  console.log('📝 Created 15 Tasks across all priorities & statuses');

  // 6. Assign Tasks
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: task1.id, userId: userMember1.id },
      { taskId: task2.id, userId: userMember1.id },
      { taskId: task2.id, userId: userMember2.id },
      { taskId: task4.id, userId: userMember2.id },
      { taskId: task5.id, userId: userAdmin1.id },
      { taskId: task7.id, userId: userAdmin1.id },
      { taskId: task8.id, userId: userMember1.id },
      { taskId: task10.id, userId: userAdmin2.id },
      { taskId: task11.id, userId: userMember3.id },
      { taskId: task13.id, userId: userMember3.id },
    ],
  });

  console.log('📌 Created Task Assignments');

  // 7. Add Sample Comments
  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        authorId: userAdmin1.id,
        content: 'The hero typography looks fantastic! Approved for production.',
      },
      {
        taskId: task2.id,
        authorId: userMember1.id,
        content: 'Added CSS custom properties for light/dark variables. Testing contrast ratios.',
      },
      {
        taskId: task2.id,
        authorId: userMember2.id,
        content: 'Checked on Safari and Chrome, dark mode toggle transitions are smooth.',
      },
      {
        taskId: task4.id,
        authorId: userAdmin1.id,
        content: 'Ensure we provide a fallback PIN passcode if biometrics fail.',
      },
      {
        taskId: task13.id,
        authorId: userAdmin2.id,
        content: 'Stripe test webhook secret is set in the staging environment.',
      },
    ],
  });

  console.log('💬 Created Sample Comments');
  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
