import { Request, Response } from 'express';
import { aiUsageService } from '../services/aiUsageService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const adminController = {
  /**
   * Quick validity verification for the Admin Key
   */
  async verifyAuth(req: Request, res: Response) {
    return sendSuccess(res, { valid: true }, 'Admin key verified');
  },

  /**
   * Comprehensive Dashboard payload (KPIs, token analytics, user overview, recent logs)
   */
  async getDashboardData(req: Request, res: Response) {
    try {
      const [stats, usersData, tokenAnalytics, recentLogs] = await Promise.all([
        aiUsageService.getPlatformStats(),
        aiUsageService.getUsersAnalytics(),
        aiUsageService.getTokenAnalytics(),
        aiUsageService.getRecentLogs(50),
      ]);

      return sendSuccess(res, {
        stats,
        users: usersData.users,
        anonymousUsage: usersData.anonymousUsage,
        tokenAnalytics,
        recentLogs,
      }, 'Admin dashboard data fetched successfully');
    } catch (err: any) {
      console.error('[adminController] Failed to fetch dashboard data:', err);
      return sendError(res, 'ADMIN_FETCH_FAILED', err.message || 'Failed to fetch admin stats', 500);
    }
  },

  /**
   * User directory listing
   */
  async getUsers(req: Request, res: Response) {
    try {
      const usersData = await aiUsageService.getUsersAnalytics();
      return sendSuccess(res, usersData, 'Users analytics fetched');
    } catch (err: any) {
      return sendError(res, 'USERS_FETCH_FAILED', err.message || 'Failed to fetch users', 500);
    }
  },

  /**
   * AI consumption logs
   */
  async getLogs(req: Request, res: Response) {
    try {
      const limit = Math.min(Number(req.query.limit) || 100, 200);
      const logs = await aiUsageService.getRecentLogs(limit);
      return sendSuccess(res, logs, 'Recent logs fetched');
    } catch (err: any) {
      return sendError(res, 'LOGS_FETCH_FAILED', err.message || 'Failed to fetch logs', 500);
    }
  },
};
