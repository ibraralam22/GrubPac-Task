import { DetailedHealthReport } from '../services/healthService';

export const renderHealthHtml = (report: DetailedHealthReport): string => {
  const isHealthy = report.status === 'healthy';
  const isDegraded = report.status === 'degraded';
  const statusColor = isHealthy ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444';
  const statusBg = isHealthy ? 'rgba(16, 185, 129, 0.15)' : isDegraded ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const statusBorder = isHealthy ? 'rgba(16, 185, 129, 0.3)' : isDegraded ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  const statusText = isHealthy ? 'All Systems Operational' : isDegraded ? 'Degraded Performance' : 'System Outage';

  const dbHealthy = report.services.database.status === 'healthy';
  const redisHealthy = report.services.redis.status === 'healthy';
  const queuesHealthy = report.services.queues.status === 'healthy';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow API • System Health & Telemetry</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(15, 23, 42, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.25);
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.08) 0px, transparent 50%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
      width: 100%;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      color: #fff;
    }
    .brand svg { width: 38px; height: 38px; }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn {
      padding: 0.5rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: var(--text);
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .btn-primary:hover {
      background: #4f46e5;
      box-shadow: 0 0 15px var(--accent-glow);
    }
    .hero-banner {
      background: var(--card-bg);
      border: 1px solid ${statusBorder};
      border-radius: 16px;
      padding: 1.75rem;
      backdrop-filter: blur(16px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .hero-status {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .status-pulse {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${statusColor};
      box-shadow: 0 0 0 0 ${statusColor};
      animation: pulse 2s infinite;
      position: relative;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 ${statusColor}99; }
      70% { box-shadow: 0 0 0 14px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }
    .hero-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.2rem;
    }
    .hero-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .auto-refresh {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.2);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      border: 1px solid var(--card-border);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1.4rem;
      backdrop-filter: blur(12px);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .card-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-healthy {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-degraded {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-down {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.85rem;
    }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { color: var(--text-muted); }
    .stat-val {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      color: #f1f5f9;
    }
    .json-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      overflow: hidden;
      margin-top: 1rem;
    }
    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.25rem;
      background: rgba(0, 0, 0, 0.3);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      user-select: none;
    }
    pre {
      margin: 0;
      padding: 1.25rem;
      background: #060911;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #cbd5e1;
      overflow-x: auto;
      max-height: 400px;
      line-height: 1.6;
    }
    footer {
      margin-top: auto;
      padding: 2rem 0;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8rem;
      border-top: 1px solid var(--card-border);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="/" class="brand">
        <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="112" height="112" rx="28" fill="#0b0f19" stroke="#1e293b" stroke-width="3"/>
          <path d="M 32 44 L 64 64 L 32 84" fill="none" stroke="#818cf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 64 64 L 96 44" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 64 64 L 96 84" fill="none" stroke="#6366f1" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="64" cy="64" r="8" fill="#a855f7" stroke="#ffffff" stroke-width="2.5" />
        </svg>
        <span class="brand-title">TaskFlow API</span>
      </a>
      <div class="nav-links">
        <a href="/" class="btn">🚀 Console</a>
        <a href="/docs" class="btn">📚 Swagger Docs</a>
        <a href="/health" class="btn btn-primary" onclick="location.reload(); return false;">🔄 Refresh</a>
      </div>
    </header>

    <div class="hero-banner">
      <div class="hero-status">
        <div class="status-pulse"></div>
        <div>
          <div class="hero-title">${statusText}</div>
          <div class="hero-desc">Last checked at <span style="font-family: 'JetBrains Mono'; color: #cbd5e1;">${new Date(report.timestamp).toLocaleTimeString()}</span></div>
        </div>
      </div>
      <div class="auto-refresh">
        <span>⏱️ Auto-refresh: <strong id="refresh-counter">5s</strong></span>
      </div>
    </div>

    <div class="grid">
      <!-- Database Status -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">🗄️ PostgreSQL Database</span>
          <span class="badge badge-${report.services.database.status}">${report.services.database.status}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Latency</span>
          <span class="stat-val" style="color: ${dbHealthy ? '#10b981' : '#ef4444'}">${report.services.database.latencyMs ? report.services.database.latencyMs + ' ms' : 'N/A'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Engine</span>
          <span class="stat-val">Prisma ORM</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Dialect</span>
          <span class="stat-val">${report.services.database.details?.dialect || 'PostgreSQL'}</span>
        </div>
      </div>

      <!-- Redis Status -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">⚡ Redis Cache & Broker</span>
          <span class="badge badge-${report.services.redis.status}">${report.services.redis.status}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Ping Latency</span>
          <span class="stat-val" style="color: ${redisHealthy ? '#10b981' : '#ef4444'}">${report.services.redis.latencyMs ? report.services.redis.latencyMs + ' ms' : 'N/A'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Host:Port</span>
          <span class="stat-val">${report.services.redis.details?.host || 'localhost'}:${report.services.redis.details?.port || 6379}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Client</span>
          <span class="stat-val">ioredis v5</span>
        </div>
      </div>

      <!-- Worker Queues -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📨 BullMQ Asynchronous Queues</span>
          <span class="badge badge-${report.services.queues.status}">${report.services.queues.status}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Active Queue</span>
          <span class="stat-val">${report.services.queues.details?.queue || 'email-notifications'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Waiting Jobs</span>
          <span class="stat-val">${report.services.queues.details?.waitingJobs ?? 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Active / Failed</span>
          <span class="stat-val">${report.services.queues.details?.activeJobs ?? 0} / ${report.services.queues.details?.failedJobs ?? 0}</span>
        </div>
      </div>

      <!-- System & Memory -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">💻 Server Process & Memory</span>
          <span class="badge badge-healthy">Online</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Uptime</span>
          <span class="stat-val">${report.uptime.formatted}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Heap Memory</span>
          <span class="stat-val">${report.system.memory.heapUsedMB} MB / ${report.system.memory.heapTotalMB} MB</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Node / Env</span>
          <span class="stat-val">${report.system.nodeVersion} (${report.environment})</span>
        </div>
      </div>
    </div>

    <!-- JSON Inspector -->
    <div class="json-section">
      <div class="json-header" onclick="const p = document.getElementById('json-pre'); p.style.display = p.style.display === 'none' ? 'block' : 'none';">
        <span>📄 Raw Diagnostic JSON</span>
        <span style="color: var(--accent); font-weight: 500;">Toggle Expand ▾</span>
      </div>
      <pre id="json-pre">${JSON.stringify(report, null, 2)}</pre>
    </div>

    <footer>
      TaskFlow API v${report.version} • High-Performance Multi-Tenant Project Management Engine
    </footer>
  </div>

  <script>
    let countdown = 5;
    const counterEl = document.getElementById('refresh-counter');
    setInterval(() => {
      countdown--;
      if (counterEl) counterEl.textContent = countdown + 's';
      if (countdown <= 0) {
        window.location.reload();
      }
    }, 1000);
  </script>
</body>
</html>`;
};
