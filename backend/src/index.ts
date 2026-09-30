import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import portfolioRoutes from './routes/portfolioRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { sendError } from './utils/response.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// 1. Defense-in-Depth Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5174',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.localhost:5174')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Clerk Authentication Middleware (Attaches auth info to req)
app.use(clerkMiddleware());

// 3. Health & Diagnostic Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Portfolify Backend API',
    version: '1.0.0',
  });
});

// 3. API V1 Routes
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/ai', aiRoutes);

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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Portfolify API server running on http://localhost:${PORT}`);
  console.log(`⚡ AI Copilot Router ready (Default provider: ${process.env.DEFAULT_AI_PROVIDER || 'groq'})`);
});

export default app;
