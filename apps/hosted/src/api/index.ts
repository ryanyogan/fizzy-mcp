import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { healthRoutes } from './health';
import { meRoutes } from './me';
import { adminRoutes } from './admin/index';

/**
 * API routes (/api/*)
 */
export const apiRoutes = new Hono<HonoEnv>();

// Public routes
apiRoutes.route('/', healthRoutes);

// User routes
apiRoutes.route('/me', meRoutes);

// Admin routes
apiRoutes.route('/admin', adminRoutes);
