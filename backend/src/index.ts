import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import portfolioRoutes from './routes/portfolioRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { sendError } from './utils/response.js';
import { metricsMiddleware, generatePrometheusMetrics } from './utils/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// 1. Defense-in-Depth Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://portfolify.tech',
  'https://portfoliobuilder-omega.vercel.app',
];

const isOriginAllowed = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) return true;
  // Allow tenant subdomains e.g. https://alex.portfolify.tech
  if (/\.portfolify\.tech$/i.test(origin)) return true;
  // Allow local development subdomains
  if (/\.localhost:(5173|5174)$/i.test(origin)) return true;
  // Allow Vercel preview deployments
  if (/^https:\/\/portfolio-builder-[a-z0-9-]+-.*\.vercel\.app$/i.test(origin)) return true;
  // In development environment only, allow local ports
  if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return true;
    }
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Metrics & Telemetry Middleware (Prometheus format)
app.use(metricsMiddleware);

// 3. Clerk Authentication Middleware (Attaches auth info to req)
app.use(clerkMiddleware());

// 4. Health & Prometheus Metrics Endpoints
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Portfolify Backend API',
    version: '1.0.0',
  });
});

app.get('/api/v1/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(generatePrometheusMetrics());
});

// 3. API V1 Routes
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/v1/admin', adminRoutes);

// 4. Global 404 Handler
app.use((req, res) => {
  sendError(res, 'ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404);
});

// 5. Global Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err);
  sendError(
    res,
    err.code || 'INTERNAL_SERVER_ERROR',
    err.message || 'An unexpected server error occurred',
    err.status || 500
  );
});

// Start Server (only when running as standalone process, not in Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Portfolify API server running on http://localhost:${PORT}`);
    console.log(`⚡ AI Copilot Router ready (Default provider: ${process.env.DEFAULT_AI_PROVIDER || 'groq'})`);
  });
}

export default app;
