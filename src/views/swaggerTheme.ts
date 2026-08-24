import { SwaggerUiOptions } from 'swagger-ui-express';

export const modernSwaggerCss = `
  /* Modern Dark Theme for Swagger UI */
  :root {
    --bg-main: #090d16;
    --bg-card: #0f172a;
    --bg-card-alt: #1e293b;
    --border-color: rgba(255, 255, 255, 0.08);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #6366f1;
    --accent-hover: #4f46e5;
  }

  body {
    background-color: var(--bg-main) !important;
    color: var(--text-main) !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
  }

  .swagger-ui {
    color: var(--text-main) !important;
  }

  /* Header / Top Bar */
  .swagger-ui .topbar {
    background-color: #0b0f19 !important;
    border-bottom: 1px solid var(--border-color) !important;
    padding: 12px 0 !important;
  }
  .swagger-ui .topbar .topbar-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  .swagger-ui .topbar .topbar-wrapper a {
    display: flex;
    align-items: center;
  }
  .swagger-ui .topbar .topbar-wrapper a span {
    font-family: 'Inter', sans-serif !important;
    font-weight: 700 !important;
    font-size: 1.15rem !important;
    color: #ffffff !important;
    margin-left: 10px;
  }

  /* Info Section */
  .swagger-ui .info {
    margin: 30px 0 !important;
  }
  .swagger-ui .info .title {
    color: #ffffff !important;
    font-weight: 800 !important;
    letter-spacing: -0.02em !important;
  }
  .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info .description {
    color: var(--text-muted) !important;
    font-size: 0.95rem !important;
  }
  .swagger-ui .info a {
    color: var(--accent) !important;
  }

  /* Schemes / Server Selector */
  .swagger-ui .scheme-container {
    background-color: var(--bg-card) !important;
    box-shadow: none !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    margin-bottom: 30px !important;
  }
  .swagger-ui .servers-title, .swagger-ui .schemes-title {
    color: var(--text-main) !important;
  }
  .swagger-ui select {
    background-color: #060911 !important;
    color: #f8fafc !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
    outline: none !important;
  }

  /* Operations Blocks */
  .swagger-ui .opblock-tag {
    color: #ffffff !important;
    font-size: 1.2rem !important;
    font-weight: 700 !important;
    border-bottom: 1px solid var(--border-color) !important;
    margin: 20px 0 10px 0 !important;
  }
  .swagger-ui .opblock {
    background: var(--bg-card) !important;
    border-radius: 12px !important;
    border: 1px solid var(--border-color) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    margin-bottom: 14px !important;
  }
  .swagger-ui .opblock .opblock-summary {
    border-color: transparent !important;
    padding: 10px 16px !important;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 8px !important;
    font-weight: 700 !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.8rem !important;
    min-width: 80px !important;
    text-shadow: none !important;
  }
  .swagger-ui .opblock .opblock-summary-path {
    color: #f8fafc !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
  }
  .swagger-ui .opblock .opblock-summary-description {
    color: var(--text-muted) !important;
    font-size: 0.85rem !important;
  }

  /* Method Specific Styling */
  .swagger-ui .opblock.opblock-get {
    border-left: 4px solid #10b981 !important;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: rgba(16, 185, 129, 0.2) !important;
    color: #10b981 !important;
    border: 1px solid rgba(16, 185, 129, 0.4) !important;
  }

  .swagger-ui .opblock.opblock-post {
    border-left: 4px solid #6366f1 !important;
  }
  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: rgba(99, 102, 241, 0.2) !important;
    color: #818cf8 !important;
    border: 1px solid rgba(99, 102, 241, 0.4) !important;
  }

  .swagger-ui .opblock.opblock-patch, .swagger-ui .opblock.opblock-put {
    border-left: 4px solid #f59e0b !important;
  }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method, .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: rgba(245, 158, 11, 0.2) !important;
    color: #f59e0b !important;
    border: 1px solid rgba(245, 158, 11, 0.4) !important;
  }

  .swagger-ui .opblock.opblock-delete {
    border-left: 4px solid #ef4444 !important;
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: rgba(239, 68, 68, 0.2) !important;
    color: #ef4444 !important;
    border: 1px solid rgba(239, 68, 68, 0.4) !important;
  }

  /* Inner Details */
  .swagger-ui .opblock-body {
    background: #090d16 !important;
    padding: 16px 20px !important;
  }
  .swagger-ui .tabli button {
    color: var(--text-muted) !important;
  }
  .swagger-ui .tabli.active button {
    color: #fff !important;
  }
  .swagger-ui .opblock-section-header {
    background-color: var(--bg-card) !important;
    color: #fff !important;
  }
  .swagger-ui .btn {
    border-radius: 8px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
  }
  .swagger-ui .btn.authorize {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    border-color: #6366f1 !important;
    color: #fff !important;
  }
  .swagger-ui .btn.execute {
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
    color: #fff !important;
  }
  .swagger-ui input[type="text"], .swagger-ui textarea {
    background-color: #0b0f19 !important;
    color: #f8fafc !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
  }
  .swagger-ui table thead tr th, .swagger-ui table thead tr td {
    color: #cbd5e1 !important;
    border-bottom: 1px solid var(--border-color) !important;
  }
  .swagger-ui .response-col_status {
    color: #10b981 !important;
    font-family: 'JetBrains Mono', monospace !important;
  }
  .swagger-ui .model-box, .swagger-ui section.models {
    background: var(--bg-card) !important;
    border-radius: 12px !important;
    border: 1px solid var(--border-color) !important;
  }
  .swagger-ui section.models h4 {
    color: #fff !important;
  }
  .swagger-ui .model-title {
    color: #cbd5e1 !important;
  }
`;

export const customSwaggerOptions: SwaggerUiOptions = {
  customCss: modernSwaggerCss,
  customSiteTitle: 'TaskFlow API • OpenAPI Specification',
  customfavIcon: '/favicon.svg',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
  },
};
