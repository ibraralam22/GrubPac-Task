import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Integration Tests: Modern Developer Experience & Diagnostics', () => {
  it('GET / with Accept: application/json should return structured API metadata', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'TaskFlow API');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('docs', '/docs');
    expect(res.body).toHaveProperty('health', '/health');
    expect(res.body.endpoints).toBeDefined();
  });

  it('GET / with Accept: text/html should return modern developer console HTML', async () => {
    const res = await request(app)
      .get('/')
      .set('Accept', 'text/html');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('TaskFlow API');
    expect(res.text).toContain('Live API Test Console & Playground');
    expect(res.text).toContain('Endpoint Directory');
  });

  it('GET /health with Accept: application/json should return deep diagnostic metrics', async () => {
    const res = await request(app)
      .get('/health')
      .set('Accept', 'application/json');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('service', 'taskflow-api');
    expect(res.body).toHaveProperty('system');
    expect(res.body.system).toHaveProperty('memory');
    expect(res.body.services).toHaveProperty('database');
    expect(res.body.services).toHaveProperty('redis');
    expect(res.body.services).toHaveProperty('queues');
  });

  it('GET /health with Accept: text/html should return visual health status dashboard', async () => {
    const res = await request(app)
      .get('/health')
      .set('Accept', 'text/html');

    expect([200, 503]).toContain(res.status);
    expect(res.header['content-type']).toContain('text/html');
    expect(res.text).toContain('TaskFlow API • System Health & Telemetry');
    expect(res.text).toContain('PostgreSQL Database');
    expect(res.text).toContain('Redis Cache & Broker');
  });

  it('GET /favicon.svg and /favicon.ico should return vector SVG brand icon with 200 OK', async () => {
    const resIco = await request(app).get('/favicon.ico');
    expect(resIco.status).toBe(200);
    expect(resIco.header['content-type']).toContain('image/svg+xml');
    const icoContent = resIco.text || (resIco.body ? resIco.body.toString() : '');
    expect(icoContent).toContain('<svg');

    const resSvg = await request(app).get('/favicon.svg');
    expect(resSvg.status).toBe(200);
    expect(resSvg.header['content-type']).toContain('image/svg+xml');
    const svgContent = resSvg.text || (resSvg.body ? resSvg.body.toString() : '');
    expect(svgContent).toContain('<svg');
  });

  it('GET /docs/openapi.yaml should return raw OpenAPI specification', async () => {
    const res = await request(app).get('/docs/openapi.yaml');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('yaml');
    expect(res.text).toContain('openapi: 3.0.3');
  });

  it('GET /unknown-route with Accept: text/html should return modern 404 HTML page', async () => {
    const res = await request(app)
      .get('/random-path-123')
      .set('Accept', 'text/html');

    expect(res.status).toBe(404);
    expect(res.text).toContain('404');
    expect(res.text).toContain('Endpoint Not Found');
  });

  it('GET /unknown-route with Accept: application/json should return 404 JSON error', async () => {
    const res = await request(app)
      .get('/random-path-123')
      .set('Accept', 'application/json');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });
});
