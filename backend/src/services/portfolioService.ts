import { db } from '../db/index.js';
import { portfolios, portfolioVersions, users } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Portfolio Service Layer
 * Strictly enforces tenant isolation on all database operations
 */
export const portfolioService = {
  /**
   * Get all portfolios owned by the authenticated tenant
   */
  async getUserPortfolios(userId: string) {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.updatedAt));
  },

  /**
   * Get single portfolio with strict tenant isolation
   */
  async getPortfolioById(portfolioId: string, userId: string) {
    const results = await db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
      .limit(1);

    return results[0] || null;
  },

  /**
   * Public subdomain resolution: only queries published portfolios
   */
  async getPublishedBySlug(slug: string) {
    const results = await db
      .select({
        id: portfolios.id,
        subdomainSlug: portfolios.subdomainSlug,
        title: portfolios.title,
        schemaData: portfolios.schemaData,
        publishedAt: portfolios.publishedAt,
        version: portfolios.version,
      })
      .from(portfolios)
      .where(and(eq(portfolios.subdomainSlug, slug), eq(portfolios.isPublished, true)))
      .limit(1);

    return results[0] || null;
  },

  /**
   * Create a new portfolio for user with initial version snapshot
   */
  async createPortfolio(
    userId: string,
    data: { title: string; subdomainSlug: string; schemaData: any; chatHistory?: any }
  ) {
    // Ensure user record exists in Neon (sync from Clerk)
    await db
      .insert(users)
      .values({
        id: userId,
        email: `${userId}@clerk.user`,
        username: data.subdomainSlug,
      })
      .onConflictDoNothing();

    const portfolioId = `port_${Date.now()}`;

    const [newPortfolio] = await db
      .insert(portfolios)
      .values({
        id: portfolioId,
        userId,
        subdomainSlug: data.subdomainSlug.toLowerCase().trim(),
        title: data.title,
        schemaData: data.schemaData,
        chatHistory: data.chatHistory ?? [],
        version: 1,
      })
      .returning();

    // Create initial version snapshot
    await db.insert(portfolioVersions).values({
      id: `ver_${Date.now()}`,
      portfolioId: newPortfolio.id,
      userId,
      snapshotData: data.schemaData,
      promptNote: 'Initial Creation',
    });

    return newPortfolio;
  },

  /**
   * Update portfolio schema and save history snapshot
   */
  async updatePortfolio(
    portfolioId: string,
    userId: string,
    data: { schemaData?: any; title?: string; isPublished?: boolean; promptNote?: string; chatHistory?: any }
  ) {
    // 1. Verify ownership
    const existing = await this.getPortfolioById(portfolioId, userId);
    if (!existing) return null;

    const nextVersion = existing.version + 1;

    // 2. Perform isolated update
    const [updated] = await db
      .update(portfolios)
      .set({
        schemaData: data.schemaData ?? existing.schemaData,
        title: data.title ?? existing.title,
        chatHistory: data.chatHistory !== undefined ? data.chatHistory : existing.chatHistory,
        isPublished: data.isPublished ?? existing.isPublished,
        publishedAt: data.isPublished ? new Date() : existing.publishedAt,
        version: nextVersion,
        updatedAt: new Date(),
      })
      .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
      .returning();

    // 3. Save snapshot to history if schema was modified
    if (data.schemaData) {
      await db.insert(portfolioVersions).values({
        id: `ver_${Date.now()}`,
        portfolioId,
        userId,
        snapshotData: data.schemaData,
        promptNote: data.promptNote || `Revision v${nextVersion}`,
      });
    }

    return updated;
  },

  /**
   * Retrieve version history for rollback drawer
   */
  async getVersions(portfolioId: string, userId: string) {
    return await db
      .select()
      .from(portfolioVersions)
      .where(and(eq(portfolioVersions.portfolioId, portfolioId), eq(portfolioVersions.userId, userId)))
      .orderBy(desc(portfolioVersions.createdAt));
  },

  /**
   * Rollback portfolio to a specific past version
   */
  async rollbackVersion(portfolioId: string, userId: string, versionId: string) {
    const versionResults = await db
      .select()
      .from(portfolioVersions)
      .where(and(eq(portfolioVersions.id, versionId), eq(portfolioVersions.userId, userId)))
      .limit(1);

    const versionRecord = versionResults[0];
    if (!versionRecord) return null;

    return await this.updatePortfolio(portfolioId, userId, {
      schemaData: versionRecord.snapshotData,
      promptNote: `Rolled back to version snapshot from ${versionRecord.createdAt.toISOString()}`,
    });
  },

  /**
   * Delete portfolio with tenant isolation
   */
  async deletePortfolio(portfolioId: string, userId: string) {
    const results = await db
      .delete(portfolios)
      .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)))
      .returning();

    return results[0] || null;
  },
};
