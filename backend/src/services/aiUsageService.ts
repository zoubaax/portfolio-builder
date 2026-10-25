import { db } from '../db/index.js';
import { users, portfolios, aiTokenLogs } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface RecordUsageParams {
  userId?: string | null;
  operation: 'stream-chat' | 'generate' | 'portfolio-chat' | 'image' | 'summarize' | 'suggest-palettes';
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  status?: 'success' | 'error';
}

/**
 * Utility to estimate token count from string length when provider doesn't report it
 * Average rule of thumb: ~4 characters per token in English / code
 */
export const estimateTokens = (text: string | null | undefined): number => {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
};

export const aiUsageService = {
  /**
   * Asynchronously records an AI token consumption event without blocking the caller
   */
  async recordUsage(params: RecordUsageParams): Promise<void> {
    try {
      const promptTokens = params.promptTokens ?? 0;
      const completionTokens = params.completionTokens ?? 0;
      const totalTokens = params.totalTokens ?? (promptTokens + completionTokens);

      await db.insert(aiTokenLogs).values({
        id: `log_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
        userId: params.userId || null,
        operation: params.operation,
        provider: params.provider || 'unknown',
        model: params.model || 'unknown',
        promptTokens,
        completionTokens,
        totalTokens,
        durationMs: params.durationMs ?? 0,
        status: params.status || 'success',
      });
    } catch (err) {
      // Fire-and-forget logging: do not crash user requests if tracking fails
      console.error('[aiUsageService] Failed to record token usage:', err);
    }
  },

  /**
   * Platform-wide aggregated statistics for admin dashboard KPI cards
   */
  async getPlatformStats() {
    // 1. User and Portfolio counts
    const [userCountRes] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [portfolioCountRes] = await db.select({
      total: sql<number>`count(*)`,
      published: sql<number>`count(*) filter (where ${portfolios.isPublished} = true)`,
    }).from(portfolios);

    // 2. Token counts & latency
    const [tokenStatsRes] = await db.select({
      totalRequests: sql<number>`count(*)`,
      totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
      promptTokens: sql<number>`coalesce(sum(${aiTokenLogs.promptTokens}), 0)`,
      completionTokens: sql<number>`coalesce(sum(${aiTokenLogs.completionTokens}), 0)`,
      avgDurationMs: sql<number>`coalesce(round(avg(${aiTokenLogs.durationMs})), 0)`,
    }).from(aiTokenLogs);

    return {
      totalUsers: Number(userCountRes?.count || 0),
      totalPortfolios: Number(portfolioCountRes?.total || 0),
      publishedPortfolios: Number(portfolioCountRes?.published || 0),
      totalAiRequests: Number(tokenStatsRes?.totalRequests || 0),
      totalTokensConsumed: Number(tokenStatsRes?.totalTokens || 0),
      promptTokensConsumed: Number(tokenStatsRes?.promptTokens || 0),
      completionTokensConsumed: Number(tokenStatsRes?.completionTokens || 0),
      avgDurationMs: Number(tokenStatsRes?.avgDurationMs || 0),
    };
  },

  /**
   * Detailed user list with their portfolios and token consumption
   */
  async getUsersAnalytics() {
    // Query users with aggregated token consumption and portfolios
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allPortfolios = await db.select().from(portfolios);
    
    // Group tokens by user
    const tokensByUser = await db
      .select({
        userId: aiTokenLogs.userId,
        totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
        requestCount: sql<number>`count(*)`,
        lastUsedAt: sql<string>`max(${aiTokenLogs.createdAt})`,
      })
      .from(aiTokenLogs)
      .groupBy(aiTokenLogs.userId);

    const tokenMap = new Map<string, { totalTokens: number; requestCount: number; lastUsedAt: string }>();
    for (const t of tokensByUser) {
      if (t.userId) {
        tokenMap.set(t.userId, {
          totalTokens: Number(t.totalTokens),
          requestCount: Number(t.requestCount),
          lastUsedAt: t.lastUsedAt,
        });
      }
    }

    // Anonymous token consumption
    const anonTokens = tokensByUser.find(t => !t.userId);

    // Group portfolios by user
    const portfoliosByUser = new Map<string, any[]>();
    for (const p of allPortfolios) {
      const list = portfoliosByUser.get(p.userId) || [];
      list.push({
        id: p.id,
        title: p.title,
        subdomainSlug: p.subdomainSlug,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
      portfoliosByUser.set(p.userId, list);
    }

    const userList = allUsers.map(u => {
      const userTokens = tokenMap.get(u.id) || { totalTokens: 0, requestCount: 0, lastUsedAt: null };
      const userPortfolios = portfoliosByUser.get(u.id) || [];
      return {
        id: u.id,
        email: u.email,
        username: u.username,
        githubUsername: u.githubUsername,
        githubAvatarUrl: u.githubAvatarUrl,
        plan: u.plan,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        portfolios: userPortfolios,
        portfolioCount: userPortfolios.length,
        hasPublished: userPortfolios.some(p => p.isPublished),
        tokensConsumed: userTokens.totalTokens,
        requestCount: userTokens.requestCount,
        lastActive: userTokens.lastUsedAt || u.updatedAt,
      };
    });

    return {
      users: userList,
      anonymousUsage: {
        totalTokens: Number(anonTokens?.totalTokens || 0),
        requestCount: Number(anonTokens?.requestCount || 0),
      },
    };
  },

  /**
   * Token analytics broken down by Provider, Model, and Operation
   */
  async getTokenAnalytics() {
    // 1. By Provider
    const byProvider = await db
      .select({
        provider: aiTokenLogs.provider,
        requestCount: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
        promptTokens: sql<number>`coalesce(sum(${aiTokenLogs.promptTokens}), 0)`,
        completionTokens: sql<number>`coalesce(sum(${aiTokenLogs.completionTokens}), 0)`,
      })
      .from(aiTokenLogs)
      .groupBy(aiTokenLogs.provider)
      .orderBy(desc(sql`sum(${aiTokenLogs.totalTokens})`));

    // 2. By Model
    const byModel = await db
      .select({
        model: aiTokenLogs.model,
        provider: aiTokenLogs.provider,
        requestCount: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
      })
      .from(aiTokenLogs)
      .groupBy(aiTokenLogs.model, aiTokenLogs.provider)
      .orderBy(desc(sql`sum(${aiTokenLogs.totalTokens})`));

    // 3. By Operation
    const byOperation = await db
      .select({
        operation: aiTokenLogs.operation,
        requestCount: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
      })
      .from(aiTokenLogs)
      .groupBy(aiTokenLogs.operation)
      .orderBy(desc(sql`sum(${aiTokenLogs.totalTokens})`));

    // 4. Daily timeline (last 14 days)
    const timeline = await db
      .select({
        date: sql<string>`to_char(${aiTokenLogs.createdAt}, 'YYYY-MM-DD')`,
        requests: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${aiTokenLogs.totalTokens}), 0)`,
      })
      .from(aiTokenLogs)
      .groupBy(sql`to_char(${aiTokenLogs.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(desc(sql`to_char(${aiTokenLogs.createdAt}, 'YYYY-MM-DD')`))
      .limit(14);

    return {
      byProvider: byProvider.map(p => ({
        provider: p.provider,
        requestCount: Number(p.requestCount),
        totalTokens: Number(p.totalTokens),
        promptTokens: Number(p.promptTokens),
        completionTokens: Number(p.completionTokens),
      })),
      byModel: byModel.map(m => ({
        model: m.model,
        provider: m.provider,
        requestCount: Number(m.requestCount),
        totalTokens: Number(m.totalTokens),
      })),
      byOperation: byOperation.map(o => ({
        operation: o.operation,
        requestCount: Number(o.requestCount),
        totalTokens: Number(o.totalTokens),
      })),
      timeline: timeline.reverse().map(t => ({
        date: t.date,
        requests: Number(t.requests),
        totalTokens: Number(t.totalTokens),
      })),
    };
  },

  /**
   * Recent AI request logs for real-time inspection
   */
  async getRecentLogs(limit: number = 60) {
    const logs = await db
      .select({
        id: aiTokenLogs.id,
        userId: aiTokenLogs.userId,
        operation: aiTokenLogs.operation,
        provider: aiTokenLogs.provider,
        model: aiTokenLogs.model,
        promptTokens: aiTokenLogs.promptTokens,
        completionTokens: aiTokenLogs.completionTokens,
        totalTokens: aiTokenLogs.totalTokens,
        durationMs: aiTokenLogs.durationMs,
        status: aiTokenLogs.status,
        createdAt: aiTokenLogs.createdAt,
      })
      .from(aiTokenLogs)
      .orderBy(desc(aiTokenLogs.createdAt))
      .limit(limit);

    // Fetch user map for display
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as string[];
    const userMap = new Map<string, { email: string; username: string | null }>();
    
    if (userIds.length > 0) {
      const matchedUsers = await db
        .select({ id: users.id, email: users.email, username: users.username })
        .from(users);
      for (const u of matchedUsers) {
        userMap.set(u.id, { email: u.email, username: u.username });
      }
    }

    return logs.map(l => ({
      ...l,
      userEmail: l.userId ? userMap.get(l.userId)?.email || l.userId : 'Anonymous / Guest',
      userName: l.userId ? userMap.get(l.userId)?.username || null : null,
    }));
  },
};
