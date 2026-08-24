import { Request, Response } from 'express';

export const TASKFLOW_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <linearGradient id="tfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background Rounded Shield -->
  <rect x="8" y="8" width="112" height="112" rx="28" fill="#0b0f19" stroke="#1e293b" stroke-width="3"/>
  <rect x="8" y="8" width="112" height="112" rx="28" fill="none" stroke="url(#tfGradient)" stroke-width="2" opacity="0.6"/>
  
  <!-- Flow Stream 1: Left Node to Center -->
  <path d="M 32 44 L 64 64 L 32 84" fill="none" stroke="url(#tfGradient)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Flow Stream 2: Center to Right Node -->
  <path d="M 64 64 L 96 44" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
  <path d="M 64 64 L 96 84" fill="none" stroke="#818cf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Node Dots -->
  <circle cx="32" cy="44" r="6" fill="#6366f1" />
  <circle cx="32" cy="84" r="6" fill="#8b5cf6" />
  <circle cx="64" cy="64" r="8" fill="#a855f7" stroke="#ffffff" stroke-width="2.5" />
  <circle cx="96" cy="44" r="6" fill="#38bdf8" />
  <circle cx="96" cy="84" r="6" fill="#06b6d4" />
</svg>`;

/**
 * Express handler for serving the SVG icon as favicon or brand logo
 */
export const faviconHandler = (_req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h
  res.status(200).send(TASKFLOW_SVG_ICON);
};
