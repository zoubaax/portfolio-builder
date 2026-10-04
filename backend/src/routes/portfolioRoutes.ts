import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createPortfolioSchema = z.object({
  title: z.string().min(2).max(100),
  subdomainSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Subdomain slug can only contain lowercase letters, numbers, and hyphens'),
  schemaData: z.record(z.any()),
  chatHistory: z.array(z.any()).optional(),
});

const updatePortfolioSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  isPublished: z.boolean().optional(),
  promptNote: z.string().optional(),
  schemaData: z.record(z.any()).optional(),
  chatHistory: z.array(z.any()).optional(),
});

// Public Subdomain Resolution Route
router.get('/public/:slug', portfolioController.getPublicBySlug);

// Protected Tenant-Isolated Routes
router.get('/', requireAuth, portfolioController.list);
router.post('/', requireAuth, validateBody(createPortfolioSchema), portfolioController.create);
router.get('/:id', requireAuth, portfolioController.getById);
router.put('/:id', requireAuth, validateBody(updatePortfolioSchema), portfolioController.update);
router.delete('/:id', requireAuth, portfolioController.delete);

// Version Control & Rollback Routes
router.get('/:id/versions', requireAuth, portfolioController.getVersions);
router.post('/:id/versions/:versionId/rollback', requireAuth, portfolioController.rollbackVersion);

export default router;
