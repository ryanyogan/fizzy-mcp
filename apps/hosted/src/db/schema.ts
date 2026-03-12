import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ============ Application Settings ============
// Configurable settings for the hosted service (managed via admin API)
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON stringified value
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  updatedBy: text('updated_by'), // user ID who last updated
});

// ============ Usage Events (for analytics) ============
// Detailed log of all tool invocations
export const usageEvents = sqliteTable(
  'usage_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'), // null for anonymous users
    apiKeyId: text('api_key_id'), // which API key was used (if any)
    sessionId: text('session_id').notNull(),
    fizzyAccountSlug: text('fizzy_account_slug'),
    toolName: text('tool_name').notNull(),
    isWriteOperation: integer('is_write_operation', { mode: 'boolean' }).notNull(),
    success: integer('success', { mode: 'boolean' }).notNull(),
    errorCode: text('error_code'),
    durationMs: integer('duration_ms'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_usage_user_id').on(table.userId),
    createdAtIdx: index('idx_usage_created_at').on(table.createdAt),
    toolNameIdx: index('idx_usage_tool_name').on(table.toolName),
    sessionIdIdx: index('idx_usage_session_id').on(table.sessionId),
  }),
);

// ============ Daily Usage Counters ============
// Aggregated daily counters for fast limit checking
export const dailyUsage = sqliteTable(
  'daily_usage',
  {
    id: text('id').primaryKey(), // format: {userId|sessionId}:{YYYY-MM-DD}
    userId: text('user_id'), // null for anonymous
    sessionId: text('session_id').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD format
    readCount: integer('read_count').notNull().default(0),
    writeCount: integer('write_count').notNull().default(0),
    lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    lookupIdx: index('idx_daily_usage_lookup').on(table.sessionId, table.date),
    userDateIdx: index('idx_daily_usage_user_date').on(table.userId, table.date),
  }),
);

// ============ Type Exports ============
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;

export type DailyUsage = typeof dailyUsage.$inferSelect;
export type NewDailyUsage = typeof dailyUsage.$inferInsert;
