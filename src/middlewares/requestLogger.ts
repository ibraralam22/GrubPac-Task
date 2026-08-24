import morgan from 'morgan';
import { env } from '../config/env';

// Colors for terminal logs
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Custom colorized tokens
morgan.token('method-badge', (req) => {
  const method = req.method || 'GET';
  switch (method) {
    case 'GET':
      return `${colors.green}${colors.bold} GET    ${colors.reset}`;
    case 'POST':
      return `${colors.magenta}${colors.bold} POST   ${colors.reset}`;
    case 'PUT':
      return `${colors.blue}${colors.bold} PUT    ${colors.reset}`;
    case 'PATCH':
      return `${colors.yellow}${colors.bold} PATCH  ${colors.reset}`;
    case 'DELETE':
      return `${colors.red}${colors.bold} DELETE ${colors.reset}`;
    default:
      return `${colors.cyan}${colors.bold} ${method.padEnd(6)} ${colors.reset}`;
  }
});

morgan.token('status-badge', (_req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `${colors.red}${colors.bold}${status}${colors.reset}`;
  if (status >= 400) return `${colors.yellow}${colors.bold}${status}${colors.reset}`;
  if (status >= 300) return `${colors.cyan}${status}${colors.reset}`;
  if (status >= 200) return `${colors.green}${colors.bold}${status}${colors.reset}`;
  return `${status}`;
});

morgan.token('time-badge', (_req, res) => {
  const getResponseTime = (morgan as any)['response-time'];
  const time = getResponseTime ? getResponseTime(_req, res) : '0';
  const num = parseFloat(time);
  if (isNaN(num)) return `${time} ms`;
  if (num > 500) return `${colors.red}${num.toFixed(1)} ms${colors.reset}`;
  if (num > 100) return `${colors.yellow}${num.toFixed(1)} ms${colors.reset}`;
  return `${colors.cyan}${num.toFixed(1)} ms${colors.reset}`;
});

export const requestLogger = morgan(
  env.NODE_ENV === 'production'
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    : ':method-badge :url :status-badge :time-badge - :res[content-length]b'
);

