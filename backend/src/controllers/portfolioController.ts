import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { portfolioService } from '../services/portfolioService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const portfolioController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const portfolios = await portfolioService.getUserPortfolios(userId);
      return sendSuccess(res, portfolios);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message || 'Failed to list portfolios', 500);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const portfolio = await portfolioService.getPortfolioById(id, userId);

      if (!portfolio) {
        return sendError(res, 'NOT_FOUND', 'Portfolio not found or unauthorized', 404);
      }

      return sendSuccess(res, portfolio);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message || 'Failed to retrieve portfolio', 500);
    }
  },

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const { title, subdomainSlug, schemaData, chatHistory } = req.body;

      const created = await portfolioService.createPortfolio(userId, {
        title,
        subdomainSlug,
        schemaData,
        chatHistory,
      });

      return sendSuccess(res, created, 'Portfolio created successfully', 201);
    } catch (err: any) {
      if (err.message?.includes('duplicate') || err.code === '23505') {
        return sendError(res, 'SLUG_TAKEN', 'This subdomain slug is already taken', 409);
      }
      return sendError(res, 'CREATE_FAILED', err.message || 'Failed to create portfolio', 500);
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const { schemaData, title, isPublished, promptNote, chatHistory } = req.body;

      const updated = await portfolioService.updatePortfolio(id, userId, {
        schemaData,
        title,
        isPublished,
        promptNote,
        chatHistory,
      });

      if (!updated) {
        return sendError(res, 'NOT_FOUND', 'Portfolio not found or unauthorized', 404);
      }

      return sendSuccess(res, updated, 'Portfolio updated successfully');
    } catch (err: any) {
      return sendError(res, 'UPDATE_FAILED', err.message || 'Failed to update portfolio', 500);
    }
  },

  async getPublicBySlug(req: AuthenticatedRequest, res: Response) {
    try {
      const slug = req.params.slug as string;
      const portfolio = await portfolioService.getPublishedBySlug(slug);

      if (!portfolio) {
        return sendError(res, 'NOT_FOUND', 'No published portfolio found for this subdomain', 404);
      }

      return sendSuccess(res, portfolio);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message || 'Failed to resolve subdomain', 500);
    }
  },

  async getVersions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const versions = await portfolioService.getVersions(id, userId);
      return sendSuccess(res, versions);
    } catch (err: any) {
      return sendError(res, 'FETCH_FAILED', err.message || 'Failed to fetch version history', 500);
    }
  },

  async rollbackVersion(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const versionId = req.params.versionId as string;
      const restored = await portfolioService.rollbackVersion(id, userId, versionId);

      if (!restored) {
        return sendError(res, 'NOT_FOUND', 'Version snapshot not found or unauthorized', 404);
      }

      return sendSuccess(res, restored, 'Portfolio restored to selected version successfully');
    } catch (err: any) {
      return sendError(res, 'ROLLBACK_FAILED', err.message || 'Failed to rollback version', 500);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const deleted = await portfolioService.deletePortfolio(id, userId);

      if (!deleted) {
        return sendError(res, 'NOT_FOUND', 'Portfolio not found or unauthorized', 404);
      }

      return sendSuccess(res, { id }, 'Portfolio deleted successfully');
    } catch (err: any) {
      return sendError(res, 'DELETE_FAILED', err.message || 'Failed to delete portfolio', 500);
    }
  },
};
