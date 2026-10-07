import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for AI operations to prevent spam and abuse
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please slow down.',
    },
  },
});

router.post('/stream-chat', aiLimiter, aiController.streamChat);
router.post('/generate', aiLimiter, aiController.generateInitial);
router.post('/generate-project-image', aiLimiter, aiController.generateProjectImage);
router.post('/summarize-project', aiLimiter, aiController.summarizeProject);
router.post('/suggest-palettes', aiLimiter, aiController.suggestPalettes);
router.post('/portfolio-chat', aiLimiter, aiController.chatWithPortfolio);

export default router;
