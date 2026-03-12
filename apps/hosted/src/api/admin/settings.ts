import { Hono } from 'hono';
import { z } from 'zod';
import type { HonoEnv } from '../../types';
import { createDb } from '../../db/index';
import { SettingsService, DEFAULT_SETTINGS, type AppSettings } from '../../services/settings';

/**
 * Admin settings routes
 */
export const adminSettingsRoutes = new Hono<HonoEnv>();

/**
 * Zod schema for settings update
 */
const settingsUpdateSchema = z.object({
  anonymous_daily_limit: z.number().int().min(0).optional(),
  authenticated_daily_limit: z.number().int().min(0).optional(),
  admin_daily_limit: z.number().int().min(-1).optional(), // -1 = unlimited
  rate_limit_window_seconds: z.number().int().min(1).optional(),
  rate_limit_max_requests: z.number().int().min(1).optional(),
  anonymous_session_ttl_days: z.number().int().min(1).optional(),
  maintenance_mode: z.boolean().optional(),
  registration_enabled: z.boolean().optional(),
});

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
 * Get all settings
 */
adminSettingsRoutes.get('/', requireAdmin, async (c) => {
  const db = createDb(c.env.DB);
  const settingsService = new SettingsService(db, c.env.KV);

  const settings = await settingsService.getAll();

  return c.json({
    settings,
    defaults: DEFAULT_SETTINGS,
  });
});

/**
 * Update settings
 */
adminSettingsRoutes.patch('/', requireAdmin, async (c) => {
  const session = c.get('session');
  const body = await c.req.json();

  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: 'validation_error',
        message: 'Invalid settings data',
        details: parsed.error.errors,
      },
      400,
    );
  }

  const db = createDb(c.env.DB);
  const settingsService = new SettingsService(db, c.env.KV);

  await settingsService.updateMany(
    parsed.data as Partial<AppSettings>,
    session.userId ?? undefined,
  );

  const updated = await settingsService.getAll();

  return c.json({
    message: 'Settings updated successfully',
    settings: updated,
  });
});

/**
 * Reset settings to defaults
 */
adminSettingsRoutes.post('/reset', requireAdmin, async (c) => {
  const session = c.get('session');
  const db = createDb(c.env.DB);
  const settingsService = new SettingsService(db, c.env.KV);

  await settingsService.resetAll(session.userId ?? undefined);

  return c.json({
    message: 'Settings reset to defaults',
    settings: DEFAULT_SETTINGS,
  });
});

/**
 * Get a specific setting
 */
adminSettingsRoutes.get('/:key', requireAdmin, async (c) => {
  const key = c.req.param('key') as keyof AppSettings;

  if (!(key in DEFAULT_SETTINGS)) {
    return c.json(
      {
        error: 'not_found',
        message: `Unknown setting: ${key}`,
      },
      404,
    );
  }

  const db = createDb(c.env.DB);
  const settingsService = new SettingsService(db, c.env.KV);

  const value = await settingsService.get(key);

  return c.json({
    key,
    value,
    default: DEFAULT_SETTINGS[key],
  });
});
