import { describe, it, expect } from 'vitest';
import { generatePrometheusMetrics, metricsMiddleware } from './metrics.js';
import { Request, Response, NextFunction } from 'express';
import EventEmitter from 'events';

describe('Prometheus Metrics Generator', () => {
  it('generates valid Prometheus text exposition output with process stats', () => {
    const output = generatePrometheusMetrics();

    expect(output).toContain('# TYPE process_uptime_seconds gauge');
    expect(output).toContain('process_uptime_seconds');
    expect(output).toContain('# TYPE nodejs_heap_used_bytes gauge');
    expect(output).toContain('nodejs_heap_used_bytes');
    expect(output).toContain('# TYPE portfolify_http_requests_total counter');
  });

  it('middleware records HTTP request statistics on finish', () => {
    const req = {
      path: '/api/v1/portfolios',
      baseUrl: '',
      method: 'GET',
    } as unknown as Request;

    const res = new EventEmitter() as unknown as Response & EventEmitter;
    (res as any).statusCode = 200;

    const next = (() => {}) as NextFunction;

    metricsMiddleware(req, res, next);
    res.emit('finish');

    const output = generatePrometheusMetrics();
    expect(output).toContain('portfolify_http_requests_total{method="GET",route="/api/v1/portfolios",status="200"} 1');
  });
});

