import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const router = Router();

// Rate limiter for studio AI operations to prevent spam and abuse
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please slow down.',
    },
  },
});

// Dedicated stricter rate limiter for public portfolio chat
const publicChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requêtes pour cet assistant. Veuillez patienter une minute.',
    },
  },
});

// Zod Validation Schemas
const streamChatSchema = z.object({
  portfolio: z.record(z.any()),
  prompt: z.string().min(1).max(5000),
  provider: z.enum(['groq', 'mistral', 'nvidia', 'byok']).optional(),
  byokKey: z.string().max(256).optional(),
});

const generateSchema = z.object({
  description: z.string().min(2).max(5000),
  provider: z.enum(['groq', 'mistral', 'nvidia', 'byok']).optional(),
  byokKey: z.string().max(256).optional(),
});

const generateProjectImageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  prompt: z.string().max(2000).optional(),
  currentImageUrl: z.string().max(1000).optional(),
});

const summarizeProjectSchema = z.object({
  name: z.string().min(1).max(200),
  owner: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  topics: z.array(z.string()).max(30).optional(),
  rawDescription: z.string().max(5000).optional(),
  readmeContent: z.string().max(25000).optional(),
  provider: z.enum(['groq', 'mistral', 'nvidia', 'byok']).optional(),
  byokKey: z.string().max(256).optional(),
});

const suggestPalettesSchema = z.object({
  prompt: z.string().min(1).max(2000),
  provider: z.enum(['groq', 'mistral', 'nvidia', 'byok']).optional(),
  byokKey: z.string().max(256).optional(),
});

const portfolioChatSchema = z.object({
  portfolio: z.record(z.any()),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(3000),
      })
    )
    .max(50)
    .optional(),
  question: z.string().min(1).max(1000),
  provider: z.enum(['openai', 'gemini', 'groq', 'nvidia', 'byok']).optional(),
  apiKey: z.string().max(256).optional(),
  model: z.string().max(100).optional(),
});

// Authenticated Studio AI Routes
router.post('/stream-chat', requireAuth, aiLimiter, validateBody(streamChatSchema), aiController.streamChat);
router.post('/generate', requireAuth, aiLimiter, validateBody(generateSchema), aiController.generateInitial);
router.post('/generate-project-image', requireAuth, aiLimiter, validateBody(generateProjectImageSchema), aiController.generateProjectImage);
router.post('/summarize-project', requireAuth, aiLimiter, validateBody(summarizeProjectSchema), aiController.summarizeProject);
router.post('/suggest-palettes', requireAuth, aiLimiter, validateBody(suggestPalettesSchema), aiController.suggestPalettes);

// Public Visitor Chatbot Route (Strictly rate-limited & model-sandboxed)
router.post('/portfolio-chat', publicChatLimiter, validateBody(portfolioChatSchema), aiController.chatWithPortfolio);

export default router;
