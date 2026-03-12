import { Hono } from 'hono';
import type { HonoEnv } from '../../types';
import { createDb } from '../../db/index';
import { UsageService } from '../../services/usage';

/**
 * Admin statistics routes
 */
export const adminStatsRoutes = new Hono<HonoEnv>();

/**
 * Require admin role middleware
 */
const requireAdmin = async (
  c: { get: (key: string) => unknown; json: (data: unknown, status?: number) => Response },
  next: () => Promise<void>,
): Promise<Response | void> => {
  const session = c.get('session') as { role: string | null };

  if (session.role !== 'admin') {
    return c.json(
      {
        error: 'forbidden',
        message: 'Admin access required',
      },
      403,
    );
  }

  await next();
};

/**
 * Get global stats overview
 */
adminStatsRoutes.get('/overview', requireAdmin, async (c) => {
  const db = createDb(c.env.DB);
  const usageService = new UsageService(db, c.env.KV);

  const from = c.req.query('from');
  const to = c.req.query('to');

  const stats = await usageService.getGlobalStats(from && to ? { from, to } : undefined);

  return c.json({
    period: {
      from: from || 'last_30_days',
      to: to || 'today',
    },
    stats,
  });
});

/**
 * Get per-tool statistics
 */
adminStatsRoutes.get('/tools', requireAdmin, async (c) => {
  const db = createDb(c.env.DB);
  const usageService = new UsageService(db, c.env.KV);

  const from = c.req.query('from');
  const to = c.req.query('to');

  const toolStats = await usageService.getToolStats(from && to ? { from, to } : undefined);

  return c.json({
    period: {
      from: from || 'last_30_days',
      to: to || 'today',
    },
    tools: toolStats,
  });
});
