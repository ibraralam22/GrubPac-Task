import { env } from '../config/env';

/**
 * ANSI Color Escape Codes
 */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgMagenta: '\x1b[45m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

/**
 * Print modern, formatted terminal startup banner
 */
export const printStartupBanner = (port: number, nodeEnv: string): void => {
  const c = colors;
  const baseUrl = `http://localhost:${port}`;
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

  console.log(`
${c.magenta}${c.bold}  ┌────────────────────────────────────────────────────────────┐${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.cyan}${c.bold}⚡ TASKFLOW API ENGINE${c.reset}  ${c.gray}v1.0.0${c.reset}                            ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.gray}Multi-Tenant Project Management & Queue Backend${c.reset}           ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  ├────────────────────────────────────────────────────────────┤${c.reset}
${c.magenta}${c.bold}  │${c.reset}                                                            ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.bold}🚀 Server Status:${c.reset}    ${c.green}${c.bold}ONLINE${c.reset} ${c.gray}(${nodeEnv})${c.reset}                     ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.bold}🌐 Developer Portal:${c.reset} ${c.cyan}${c.bold}${baseUrl}/${c.reset}                     ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.bold}📖 Swagger UI Docs:${c.reset}  ${c.blue}${baseUrl}/docs${c.reset}                     ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.bold}🩺 System Health:${c.reset}    ${c.green}${baseUrl}/health${c.reset}                   ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}                                                            ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.gray}• Node.js:${c.reset}  ${c.white}${process.version}${c.reset}     ${c.gray}• Redis:${c.reset} ${c.white}${env.REDIS_HOST}:${env.REDIS_PORT}${c.reset}          ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  │${c.reset}  ${c.gray}• Memory:${c.reset}   ${c.white}${mem} MB${c.reset}        ${c.gray}• PID:${c.reset}   ${c.white}${process.pid}${c.reset}                     ${c.magenta}${c.bold}│${c.reset}
${c.magenta}${c.bold}  └────────────────────────────────────────────────────────────┘${c.reset}
`);
};
