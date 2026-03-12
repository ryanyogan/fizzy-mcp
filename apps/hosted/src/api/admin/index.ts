import { Hono } from 'hono';
import type { HonoEnv } from '../../types';
import { adminSettingsRoutes } from './settings';
import { adminStatsRoutes } from './stats';

/**
 * Admin routes (/api/admin/*)
 */
export const adminRoutes = new Hono<HonoEnv>();

// Mount sub-routes
adminRoutes.route('/settings', adminSettingsRoutes);
adminRoutes.route('/stats', adminStatsRoutes);
