import { Hono } from 'hono';
import type { HonoEnv } from '../types';
import { healthRoutes } from './health';

/**
 * API routes (/api/*)
 *
 * Simplified - just health endpoints
 */
export const apiRoutes = new Hono<HonoEnv>();

// Health routes only
apiRoutes.route('/', healthRoutes);
