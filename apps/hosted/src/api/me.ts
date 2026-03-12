import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { createDb } from '../db/index';
import { UsageService } from '../services/usage';
import { SettingsService } from '../services/settings';
import { getTierLimit } from '../mcp/server';

/**
 * User routes (/api/me/*)
 * Endpoints for the current user's data
 */
export const meRoutes = new Hono<HonoEnv>();

/**
 * Get current user/session info
 */
meRoutes.get('/', (c) => {
  const session = c.get('session');

  return c.json({
    userId: session.userId,
    sessionId: session.sessionId,
    tier: session.tier,
    role: session.role,
    isAnonymous: session.isAnonymous,
  });
});

/**
 * Get current day's usage
 */
meRoutes.get('/usage', async (c) => {
  const session = c.get('session');
  const db = createDb(c.env.DB);
  const usageService = new UsageService(db, c.env.KV);
  const settingsService = new SettingsService(db, c.env.KV);

  const today = new Date().toISOString().split('T')[0]!;
  const usage = await usageService.getDailyUsage(session.sessionId, session.userId, today);
  const settings = await settingsService.getAll();
  const limit = getTierLimit(session.tier, settings);

  return c.json({
    date: today,
    reads: usage.readCount,
    writes: usage.writeCount,
    limit: limit === -1 ? 'unlimited' : limit,
    remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - usage.writeCount),
    tier: session.tier,
    resetAt: `${today}T00:00:00Z`,
  });
});

/**
 * Get usage history (authenticated users only)
 */
meRoutes.get('/usage/history', async (c) => {
  const session = c.get('session');

  if (session.isAnonymous || !session.userId) {
    return c.json(
      {
        error: 'authentication_required',
        message: 'Usage history requires an authenticated account',
      },
      401,
    );
  }

  const db = createDb(c.env.DB);
  const usageService = new UsageService(db, c.env.KV);

  const limit = parseInt(c.req.query('limit') || '30', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const history = await usageService.getUserHistory(session.userId, {
    limit: Math.min(limit, 90), // Max 90 days
    offset,
  });

  return c.json({
    userId: session.userId,
    history,
    pagination: {
      limit,
      offset,
    },
  });
});

/**
 * Get recent events (authenticated users only)
 */
meRoutes.get('/events', async (c) => {
  const session = c.get('session');

  if (session.isAnonymous || !session.userId) {
    return c.json(
      {
        error: 'authentication_required',
        message: 'Event history requires an authenticated account',
      },
      401,
    );
  }

  const db = createDb(c.env.DB);
  const usageService = new UsageService(db, c.env.KV);

  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);

  const events = await usageService.getUserEvents(session.userId, {
    limit: Math.min(limit, 100),
    offset,
  });

  return c.json({
    userId: session.userId,
    events,
    pagination: {
      limit,
      offset,
    },
  });
});
