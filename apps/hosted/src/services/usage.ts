import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';
import type { Database } from '../db/index';
import { usageEvents, dailyUsage, type NewUsageEvent } from '../db/schema';

/**
 * Daily usage counts
 */
export interface DailyUsageCount {
  readCount: number;
  writeCount: number;
}

/**
 * Usage tracking service
 */
export class UsageService {
  constructor(
    private readonly db: Database,
    private readonly kv: KVNamespace,
  ) {}

  /**
   * Get today's date in YYYY-MM-DD format (UTC)
   */
  private getToday(): string {
    return new Date().toISOString().split('T')[0] as string;
  }

  /**
   * Generate a daily usage ID
   */
  private getDailyId(identifier: string, date: string): string {
    return `${identifier}:${date}`;
  }

  /**
   * Record a tool invocation
   */
  async recordEvent(event: Omit<NewUsageEvent, 'id' | 'createdAt'>): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date();
    const today = this.getToday();

    // Insert the usage event
    await this.db.insert(usageEvents).values({
      ...event,
      id,
      createdAt: now,
    });

    // Update daily counter
    const identifier = event.userId ?? event.sessionId;
    const dailyId = this.getDailyId(identifier, today);

    // Check if daily record exists
    const existing = await this.db
      .select()
      .from(dailyUsage)
      .where(eq(dailyUsage.id, dailyId))
      .get();

    if (existing) {
      // Update existing record
      if (event.isWriteOperation) {
        await this.db
          .update(dailyUsage)
          .set({
            writeCount: sql`${dailyUsage.writeCount} + 1`,
            lastUpdated: now,
          })
          .where(eq(dailyUsage.id, dailyId));
      } else {
        await this.db
          .update(dailyUsage)
          .set({
            readCount: sql`${dailyUsage.readCount} + 1`,
            lastUpdated: now,
          })
          .where(eq(dailyUsage.id, dailyId));
      }
    } else {
      // Insert new record
      await this.db.insert(dailyUsage).values({
        id: dailyId,
        userId: event.userId ?? null,
        sessionId: event.sessionId,
        date: today,
        readCount: event.isWriteOperation ? 0 : 1,
        writeCount: event.isWriteOperation ? 1 : 0,
        lastUpdated: now,
      });
    }

    // Update KV cache for fast access
    await this.updateKvCache(identifier, today, event.isWriteOperation);
  }

  /**
   * Update KV cache after recording an event
   */
  private async updateKvCache(identifier: string, date: string, isWrite: boolean): Promise<void> {
    const kvKey = `daily:${identifier}:${date}`;
    const cached = await this.kv.get<DailyUsageCount>(kvKey, 'json');

    const updated: DailyUsageCount = cached
      ? {
          readCount: cached.readCount + (isWrite ? 0 : 1),
          writeCount: cached.writeCount + (isWrite ? 1 : 0),
        }
      : {
          readCount: isWrite ? 0 : 1,
          writeCount: isWrite ? 1 : 0,
        };

    await this.kv.put(kvKey, JSON.stringify(updated), {
      expirationTtl: 86400, // 24 hours
    });
  }

  /**
   * Get daily usage for a user/session
   */
  async getDailyUsage(
    sessionId: string,
    userId: string | null,
    date?: string,
  ): Promise<DailyUsageCount> {
    const targetDate = date ?? this.getToday();
    const identifier = userId ?? sessionId;

    // Check KV cache first
    const kvKey = `daily:${identifier}:${targetDate}`;
    const cached = await this.kv.get<DailyUsageCount>(kvKey, 'json');

    if (cached) {
      return cached;
    }

    // Query database
    const dailyId = this.getDailyId(identifier, targetDate);
    const row = await this.db.select().from(dailyUsage).where(eq(dailyUsage.id, dailyId)).get();

    const result: DailyUsageCount = {
      readCount: row?.readCount ?? 0,
      writeCount: row?.writeCount ?? 0,
    };

    // Cache the result
    await this.kv.put(kvKey, JSON.stringify(result), {
      expirationTtl: 86400, // 24 hours
    });

    return result;
  }

  /**
   * Get usage history for a user
   */
  async getUserHistory(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Array<{ date: string; readCount: number; writeCount: number }>> {
    const limit = options?.limit ?? 30;
    const offset = options?.offset ?? 0;

    const rows = await this.db
      .select({
        date: dailyUsage.date,
        readCount: dailyUsage.readCount,
        writeCount: dailyUsage.writeCount,
      })
      .from(dailyUsage)
      .where(eq(dailyUsage.userId, userId))
      .orderBy(desc(dailyUsage.date))
      .limit(limit)
      .offset(offset);

    return rows;
  }

  /**
   * Get recent events for a user
   */
  async getUserEvents(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Array<typeof usageEvents.$inferSelect>> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    return this.db
      .select()
      .from(usageEvents)
      .where(eq(usageEvents.userId, userId))
      .orderBy(desc(usageEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get global stats for admin dashboard
   */
  async getGlobalStats(dateRange?: { from: string; to: string }): Promise<{
    totalEvents: number;
    totalReads: number;
    totalWrites: number;
    uniqueUsers: number;
    uniqueSessions: number;
  }> {
    const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] as string;
    const from = dateRange?.from ?? defaultFrom;
    const to = dateRange?.to ?? this.getToday();

    const result = await this.db
      .select({
        totalReads: sql<number>`COALESCE(SUM(${dailyUsage.readCount}), 0)`,
        totalWrites: sql<number>`COALESCE(SUM(${dailyUsage.writeCount}), 0)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${dailyUsage.userId})`,
        uniqueSessions: sql<number>`COUNT(DISTINCT ${dailyUsage.sessionId})`,
      })
      .from(dailyUsage)
      .where(and(gte(dailyUsage.date, from), lte(dailyUsage.date, to)))
      .get();

    return {
      totalEvents: (result?.totalReads ?? 0) + (result?.totalWrites ?? 0),
      totalReads: result?.totalReads ?? 0,
      totalWrites: result?.totalWrites ?? 0,
      uniqueUsers: result?.uniqueUsers ?? 0,
      uniqueSessions: result?.uniqueSessions ?? 0,
    };
  }

  /**
   * Get per-tool usage stats
   */
  async getToolStats(dateRange?: { from: string; to: string }): Promise<
    Array<{
      toolName: string;
      count: number;
      successRate: number;
      avgDurationMs: number;
    }>
  > {
    const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const from = dateRange?.from ?? defaultFrom;
    const to = dateRange?.to ?? new Date().toISOString();

    const rows = await this.db
      .select({
        toolName: usageEvents.toolName,
        count: sql<number>`COUNT(*)`.as('count'),
        successCount: sql<number>`SUM(CASE WHEN ${usageEvents.success} THEN 1 ELSE 0 END)`.as(
          'success_count',
        ),
        avgDurationMs: sql<number>`AVG(${usageEvents.durationMs})`.as('avg_duration'),
      })
      .from(usageEvents)
      .where(
        and(gte(usageEvents.createdAt, new Date(from)), lte(usageEvents.createdAt, new Date(to))),
      )
      .groupBy(usageEvents.toolName)
      .orderBy(desc(sql`COUNT(*)`));

    return rows.map((row) => ({
      toolName: row.toolName,
      count: row.count,
      successRate: row.count > 0 ? (row.successCount / row.count) * 100 : 0,
      avgDurationMs: Math.round(row.avgDurationMs ?? 0),
    }));
  }
}
