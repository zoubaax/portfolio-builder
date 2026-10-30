import { Request, Response, NextFunction } from 'express';

interface RouteStats {
  count: number;
  totalDurationMs: number;
  statusCodes: Record<string, number>;
}

// In-memory Prometheus metric accumulators
const routeMetrics = new Map<string, RouteStats>();
const processStartTime = Date.now();

/**
 * Normalizes dynamic URL paths to avoid cardinality explosions in Prometheus
 * e.g. /api/v1/portfolios/port_173000 -> /api/v1/portfolios/:id
 */
function normalizePath(path: string): string {
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
    .replace(/\/port_[0-9]+/g, '/:portfolioId')
    .replace(/\/ver_[0-9]+/g, '/:versionId')
    .replace(/\/public\/[a-z0-9-]+/gi, '/public/:slug');
}

/**
 * Express Middleware to track HTTP traffic and response latency
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/v1/metrics' || req.path === '/api/v1/health') {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const normalizedRoute = normalizePath(req.baseUrl + req.path);
    const key = `${method} ${normalizedRoute}`;
    const statusCode = String(res.statusCode);

    let stats = routeMetrics.get(key);
    if (!stats) {
      stats = { count: 0, totalDurationMs: 0, statusCodes: {} };
      routeMetrics.set(key, stats);
    }

    stats.count += 1;
    stats.totalDurationMs += duration;
    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
  });

  next();
}

/**
 * Generates official Prometheus Text Exposition format (v0.0.4)
 */
export function generatePrometheusMetrics(): string {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - processStartTime) / 1000);

  const lines: string[] = [
    '# HELP process_uptime_seconds Total seconds since application boot',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptimeSeconds}`,
    '',
    '# HELP nodejs_heap_used_bytes Node.js memory heap used',
    '# TYPE nodejs_heap_used_bytes gauge',
    `nodejs_heap_used_bytes ${mem.heapUsed}`,
    '',
    '# HELP nodejs_heap_total_bytes Node.js total allocated heap',
    '# TYPE nodejs_heap_total_bytes gauge',
    `nodejs_heap_total_bytes ${mem.heapTotal}`,
    '',
    '# HELP nodejs_rss_bytes Node.js resident set size',
    '# TYPE nodejs_rss_bytes gauge',
    `nodejs_rss_bytes ${mem.rss}`,
    '',
    '# HELP portfolify_http_requests_total Total number of HTTP requests processed by endpoint and status',
    '# TYPE portfolify_http_requests_total counter',
  ];

  for (const [key, stats] of routeMetrics.entries()) {
    const [method, route] = key.split(' ');
    for (const [status, count] of Object.entries(stats.statusCodes)) {
      lines.push(`portfolify_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
    }
  }

  lines.push('');
  lines.push('# HELP portfolify_http_request_duration_ms_avg Average request duration in milliseconds');
  lines.push('# TYPE portfolify_http_request_duration_ms_avg gauge');

  for (const [key, stats] of routeMetrics.entries()) {
    const [method, route] = key.split(' ');
    const avg = stats.count > 0 ? (stats.totalDurationMs / stats.count).toFixed(2) : '0';
    lines.push(`portfolify_http_request_duration_ms_avg{method="${method}",route="${route}"} ${avg}`);
  }

  lines.push('');
  return lines.join('\n');
}

