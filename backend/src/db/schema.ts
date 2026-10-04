import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Users Table
 * Maps directly to Clerk authenticated user identities
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk User ID (e.g. 'user_2xyz...')
  email: varchar('email', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }),
  plan: varchar('plan', { length: 50 }).default('free').notNull(),
  byokGroqKey: text('byok_groq_key'),
  byokMistralKey: text('byok_mistral_key'),
  byokNvidiaKey: text('byok_nvidia_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Portfolios Table
 * Multi-tenant user portfolios with JSONB schema storage and custom subdomains
 */
export const portfolios = pgTable('portfolios', {
  id: text('id').primaryKey(), // Custom ID e.g. 'port_123'
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subdomainSlug: varchar('subdomain_slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  schemaData: jsonb('schema_data').notNull(), // Complete PortfolioSchema JSON
  chatHistory: jsonb('chat_history').default([]), // Persistent multi-chat session conversation messages
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Portfolio Versions Table
 * Point-in-time snapshot history for one-click rollback & version tracking
 */
export const portfolioVersions = pgTable('portfolio_versions', {
  id: text('id').primaryKey(),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  snapshotData: jsonb('snapshot_data').notNull(),
  promptNote: text('prompt_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relational Definitions
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  versions: many(portfolioVersions),
}));

export const portfolioVersionsRelations = relations(portfolioVersions, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioVersions.portfolioId],
    references: [portfolios.id],
  }),
  user: one(users, {
    fields: [portfolioVersions.userId],
    references: [users.id],
  }),
}));
