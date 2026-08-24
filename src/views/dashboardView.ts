import { DetailedHealthReport } from '../services/healthService';

export const renderDashboardHtml = (report: DetailedHealthReport): string => {
  const uptime = report.uptime.formatted;
  const isHealthy = report.status === 'healthy';
  const statusColor = isHealthy ? '#10b981' : '#f59e0b';
  const statusText = isHealthy ? 'All Systems Operational' : 'Degraded Performance';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow API • Developer Console & Platform Hub</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --bg-card: rgba(15, 23, 42, 0.7);
      --bg-card-hover: rgba(30, 41, 59, 0.8);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-glow: rgba(99, 102, 241, 0.4);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.3);
      --primary: #8b5cf6;
      --cyan: #06b6d4;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 45%),
        radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.12) 0px, transparent 40%),
        radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      width: 100%;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.25rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: #fff;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      filter: drop-shadow(0 0 12px var(--accent-glow));
    }

    .brand-text h1 {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-text p {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.55rem 1.1rem;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: 1px solid var(--card-border);
      background: var(--bg-card);
      color: var(--text);
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-color: #6366f1;
      color: #fff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    /* Hero Section */
    .hero {
      background: var(--bg-card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2.25rem;
      backdrop-filter: blur(16px);
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
      align-items: center;
    }

    @media (max-width: 860px) {
      .hero { grid-template-columns: 1fr; }
    }

    .hero-content h2 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #fff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-content p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      max-width: 540px;
    }

    .status-badge-live {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 0.9rem;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 30px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 1.25rem;
    }

    .pulse-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: livePulse 1.8s infinite;
    }

    @keyframes livePulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 16px #10b981; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    .hero-stats-panel {
      background: rgba(6, 9, 17, 0.85);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .metric-box {
      padding: 0.75rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .metric-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .metric-val {
      font-size: 1.05rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: #fff;
    }

    /* Section Tabs / Layout */
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    /* Interactive Sandbox */
    .sandbox-card {
      background: var(--bg-card);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 1.75rem;
      backdrop-filter: blur(16px);
      margin-bottom: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .sandbox-controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .select-input, .text-input {
      background: #060911;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 0.6rem 0.9rem;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .select-input:focus, .text-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }

    .select-input { min-width: 140px; cursor: pointer; }
    .text-input { flex: 1; min-width: 200px; font-family: 'JetBrains Mono', monospace; }

    .headers-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 640px) {
      .headers-row { grid-template-columns: 1fr; }
    }

    .editor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .editor-grid { grid-template-columns: 1fr; }
    }

    .editor-pane {
      background: #060911;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      padding: 0.5rem 0.85rem;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--card-border);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    textarea.code-area {
      width: 100%;
      height: 180px;
      background: transparent;
      border: none;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 0.85rem;
      resize: vertical;
      outline: none;
      line-height: 1.5;
    }

    pre.response-area {
      height: 180px;
      overflow: auto;
      margin: 0;
      padding: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #38bdf8;
      background: transparent;
      line-height: 1.5;
    }

    .sandbox-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    /* Route Explorer */
    .routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .route-card {
      background: var(--bg-card);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.25rem;
      backdrop-filter: blur(12px);
      transition: all 0.2s ease;
    }

    .route-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }

    .route-card-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
    }

    .method-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .method-get { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-post { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .method-patch { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

    .route-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
    }

    .route-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    footer {
      margin-top: auto;
      padding: 2rem 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--card-border);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="/" class="brand">
        <svg class="brand-icon" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="112" height="112" rx="28" fill="#0b0f19" stroke="#1e293b" stroke-width="3"/>
          <path d="M 32 44 L 64 64 L 32 84" fill="none" stroke="#818cf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 64 64 L 96 44" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 64 64 L 96 84" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="64" cy="64" r="8" fill="#a855f7" stroke="#ffffff" stroke-width="2.5" />
        </svg>
        <div class="brand-text">
          <h1>TaskFlow API</h1>
          <p>Multi-Tenant Enterprise Workflow Backend</p>
        </div>
      </a>
      <div class="header-actions">
        <a href="/health" class="btn">🩺 System Health</a>
        <a href="/docs" class="btn btn-primary">📖 Interactive API Docs</a>
      </div>
    </header>

    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-content">
        <div class="status-badge-live">
          <span class="pulse-dot"></span>
          <span>${statusText}</span>
        </div>
        <h2>Enterprise Architecture. Instant Scalability.</h2>
        <p>
          High-concurrency multi-tenant task management backend built with Node.js, TypeScript, PostgreSQL, Redis caching, and BullMQ background queue workers.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="/docs" class="btn btn-primary">🚀 Explore Swagger UI</a>
          <a href="/health" class="btn">📊 Diagnostics Status</a>
          <a href="/docs/openapi.yaml" class="btn" download>📥 OpenAPI Spec</a>
        </div>
      </div>

      <div class="hero-stats-panel">
        <div class="metric-box">
          <div class="metric-label">🗄️ Database</div>
          <div class="metric-val" style="color: #10b981;">
            ${report.services.database.latencyMs ? report.services.database.latencyMs + 'ms' : 'Connected'}
          </div>
        </div>
        <div class="metric-box">
          <div class="metric-label">⚡ Redis Cache</div>
          <div class="metric-val" style="color: #38bdf8;">
            ${report.services.redis.latencyMs ? report.services.redis.latencyMs + 'ms' : 'Connected'}
          </div>
        </div>
        <div class="metric-box">
          <div class="metric-label">⏱️ Server Uptime</div>
          <div class="metric-val">${uptime}</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">💻 Memory Heap</div>
          <div class="metric-val">${report.system.memory.heapUsedMB} MB</div>
        </div>
      </div>
    </div>

    <!-- Live API Playground Sandbox -->
    <div class="section-title">
      <span>⚡</span> Live API Test Console & Playground
    </div>
    <div class="sandbox-card">
      <div class="sandbox-controls">
        <select id="endpoint-preset" class="select-input" onchange="loadPreset()">
          <option value="health">GET /health</option>
          <option value="login">POST /auth/login</option>
          <option value="register">POST /auth/register</option>
          <option value="me">GET /auth/me</option>
          <option value="projects">GET /projects</option>
          <option value="create_project">POST /projects</option>
          <option value="tasks">GET /tasks</option>
        </select>
        <select id="http-method" class="select-input" style="max-width: 100px;">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="text" id="api-url" class="text-input" value="/health" placeholder="/path">
      </div>

      <div class="headers-row">
        <input type="text" id="auth-token" class="text-input" placeholder="Bearer JWT Token (Optional or auto-filled on login)">
        <input type="text" id="org-header" class="text-input" placeholder="x-organization-id (Optional for multi-tenancy)">
      </div>

      <div class="editor-grid">
        <div class="editor-pane">
          <div class="editor-header">
            <span>REQUEST BODY (JSON)</span>
            <span id="body-hint" style="color: var(--cyan); cursor: pointer;" onclick="formatJsonInput()">Format JSON</span>
          </div>
          <textarea id="request-body" class="code-area" placeholder="{}"></textarea>
        </div>

        <div class="editor-pane">
          <div class="editor-header">
            <span>RESPONSE INSPECTOR</span>
            <span id="response-status-badge" style="color: var(--text-muted); font-family: 'JetBrains Mono';">Ready</span>
          </div>
          <pre id="response-display" class="response-area">// Click "Execute Request" to test live endpoint</pre>
        </div>
      </div>

      <div class="sandbox-actions">
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="executeApiCall()">⚡ Execute Request</button>
          <button class="btn" onclick="copyCurl()">📋 Copy cURL</button>
        </div>
        <span id="latency-tag" style="font-size: 0.8rem; color: var(--text-muted); font-family: 'JetBrains Mono';"></span>
      </div>
    </div>

    <!-- Active Route Catalog -->
    <div class="section-title">
      <span>🗂️</span> Endpoint Directory & Resource Explorer
    </div>
    <div class="routes-grid">
      <!-- Auth -->
      <div class="route-card" onclick="setPresetUrl('POST', '/auth/register', JSON.stringify({ email: 'user@example.com', password: 'Password123!', name: 'Alex Smith', organizationName: 'Acme Corp' }, null, 2))">
        <div class="route-card-header">
          <span class="method-badge method-post">POST</span>
          <span class="route-path">/auth/register</span>
        </div>
        <p class="route-desc">Register new user and provision root tenant organization.</p>
      </div>

      <div class="route-card" onclick="setPresetUrl('POST', '/auth/login', JSON.stringify({ email: 'user@example.com', password: 'Password123!' }, null, 2))">
        <div class="route-card-header">
          <span class="method-badge method-post">POST</span>
          <span class="route-path">/auth/login</span>
        </div>
        <p class="route-desc">Authenticate credentials and generate JWT access & refresh tokens.</p>
      </div>

      <div class="route-card" onclick="setPresetUrl('GET', '/auth/me', '')">
        <div class="route-card-header">
          <span class="method-badge method-get">GET</span>
          <span class="route-path">/auth/me</span>
        </div>
        <p class="route-desc">Retrieve profile and tenant memberships for current authenticated user.</p>
      </div>

      <!-- Projects -->
      <div class="route-card" onclick="setPresetUrl('GET', '/projects?page=1&limit=10', '')">
        <div class="route-card-header">
          <span class="method-badge method-get">GET</span>
          <span class="route-path">/projects</span>
        </div>
        <p class="route-desc">List tenant projects with pagination and active task counts.</p>
      </div>

      <div class="route-card" onclick="setPresetUrl('POST', '/projects', JSON.stringify({ name: 'Mobile App Redesign', description: 'React Native redesign phase' }, null, 2))">
        <div class="route-card-header">
          <span class="method-badge method-post">POST</span>
          <span class="route-path">/projects</span>
        </div>
        <p class="route-desc">Create a new workspace project within active organization.</p>
      </div>

      <!-- Tasks -->
      <div class="route-card" onclick="setPresetUrl('GET', '/tasks?page=1&limit=20', '')">
        <div class="route-card-header">
          <span class="method-badge method-get">GET</span>
          <span class="route-path">/tasks</span>
        </div>
        <p class="route-desc">Filter and search tasks by status, priority, assignee, or keyword.</p>
      </div>

      <div class="route-card" onclick="setPresetUrl('POST', '/tasks', JSON.stringify({ title: 'Deploy to Staging', priority: 'high', status: 'todo' }, null, 2))">
        <div class="route-card-header">
          <span class="method-badge method-post">POST</span>
          <span class="route-path">/tasks</span>
        </div>
        <p class="route-desc">Create a task with priority, tags, assignment, and due dates.</p>
      </div>

      <div class="route-card" onclick="setPresetUrl('PATCH', '/tasks/bulk-status', JSON.stringify({ taskIds: [], status: 'in_progress' }, null, 2))">
        <div class="route-card-header">
          <span class="method-badge method-patch">PATCH</span>
          <span class="route-path">/tasks/bulk-status</span>
        </div>
        <p class="route-desc">Atomic bulk status update for multiple task cards.</p>
      </div>

      <!-- Jobs & System -->
      <div class="route-card" onclick="setPresetUrl('GET', '/health', '')">
        <div class="route-card-header">
          <span class="method-badge method-get">GET</span>
          <span class="route-path">/health</span>
        </div>
        <p class="route-desc">Deep diagnostic telemetry for PostgreSQL, Redis, and BullMQ queues.</p>
      </div>
    </div>

    <footer>
      TaskFlow API Engine v${report.version} • Built with Node.js, Express, TypeScript, PostgreSQL, Redis, and BullMQ
    </footer>
  </div>

  <script>
    const presets = {
      health: { method: 'GET', url: '/health', body: '' },
      login: { method: 'POST', url: '/auth/login', body: JSON.stringify({ email: 'admin1@acme.com', password: 'Password123!' }, null, 2) },
      register: { method: 'POST', url: '/auth/register', body: JSON.stringify({ email: 'lead@example.com', password: 'Password123!', name: 'Jordan Rivera', organizationName: 'Apex Innovations' }, null, 2) },
      me: { method: 'GET', url: '/auth/me', body: '' },
      projects: { method: 'GET', url: '/projects?page=1&limit=10', body: '' },
      create_project: { method: 'POST', url: '/projects', body: JSON.stringify({ name: 'Q3 Product Roadmap', description: 'Core deliverables for enterprise customer rollout' }, null, 2) },
      tasks: { method: 'GET', url: '/tasks?page=1&limit=10', body: '' },
    };

    function loadPreset() {
      const key = document.getElementById('endpoint-preset').value;
      if (presets[key]) {
        document.getElementById('http-method').value = presets[key].method;
        document.getElementById('api-url').value = presets[key].url;
        document.getElementById('request-body').value = presets[key].body;
      }
    }

    function setPresetUrl(method, url, body) {
      document.getElementById('http-method').value = method;
      document.getElementById('api-url').value = url;
      document.getElementById('request-body').value = body;
      window.scrollTo({ top: document.querySelector('.sandbox-card').offsetTop - 30, behavior: 'smooth' });
    }

    function formatJsonInput() {
      const area = document.getElementById('request-body');
      try {
        if (area.value.trim()) {
          area.value = JSON.stringify(JSON.parse(area.value), null, 2);
        }
      } catch (e) {
        alert('Invalid JSON syntax: ' + e.message);
      }
    }

    async function executeApiCall() {
      const method = document.getElementById('http-method').value;
      const url = document.getElementById('api-url').value.trim();
      const token = document.getElementById('auth-token').value.trim();
      const orgId = document.getElementById('org-header').value.trim();
      const bodyText = document.getElementById('request-body').value.trim();
      const display = document.getElementById('response-display');
      const statusBadge = document.getElementById('response-status-badge');
      const latencyTag = document.getElementById('latency-tag');

      display.textContent = '// Sending request...';
      display.style.color = '#94a3b8';
      statusBadge.textContent = 'Executing...';
      statusBadge.style.color = '#94a3b8';

      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
      if (orgId) headers['x-organization-id'] = orgId;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText) {
        headers['Content-Type'] = 'application/json';
      }

      const tStart = performance.now();
      try {
        const res = await fetch(url, {
          method,
          headers,
          body: ['POST', 'PUT', 'PATCH'].includes(method) && bodyText ? bodyText : undefined,
        });

        const duration = Math.round(performance.now() - tStart);
        latencyTag.textContent = \`⏱️ \${duration} ms\`;

        statusBadge.textContent = \`HTTP \${res.status} \${res.statusText}\`;
        statusBadge.style.color = res.ok ? '#10b981' : '#ef4444';

        const json = await res.json().catch(() => null);
        if (json) {
          display.textContent = JSON.stringify(json, null, 2);
          display.style.color = res.ok ? '#38bdf8' : '#f87171';

          // Auto capture token if logging in
          if (json.data && json.data.accessToken) {
            document.getElementById('auth-token').value = json.data.accessToken;
            if (json.data.user && json.data.user.memberships && json.data.user.memberships[0]) {
              document.getElementById('org-header').value = json.data.user.memberships[0].organizationId;
            }
          }
        } else {
          display.textContent = \`// Empty response or non-JSON content\`;
        }
      } catch (err) {
        statusBadge.textContent = 'Connection Error';
        statusBadge.style.color = '#ef4444';
        display.textContent = '// Failed to connect to server:\\n' + err.message;
        display.style.color = '#ef4444';
      }
    }

    function copyCurl() {
      const method = document.getElementById('http-method').value;
      const url = window.location.origin + document.getElementById('api-url').value.trim();
      const token = document.getElementById('auth-token').value.trim();
      const orgId = document.getElementById('org-header').value.trim();
      const bodyText = document.getElementById('request-body').value.trim();

      let curl = \`curl -X \${method} "\${url}" \\\n  -H "Accept: application/json"\`;
      if (token) curl += \` \\\n  -H "Authorization: Bearer \${token.replace('Bearer ', '')}"\`;
      if (orgId) curl += \` \\\n  -H "x-organization-id: \${orgId}"\`;
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyText) {
        curl += \` \\\n  -H "Content-Type: application/json" \\\n  -d '\${bodyText.replace(/'/g, "'\\\\''")}'\`;
      }

      navigator.clipboard.writeText(curl).then(() => {
        alert('cURL command copied to clipboard!');
      });
    }
  </script>
</body>
</html>`;
};
