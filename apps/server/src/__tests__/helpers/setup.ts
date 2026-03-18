/**
 * MSW server setup for tests.
 */

import { setupServer } from 'msw/node';
import { handlers } from './msw-handlers.js';

/**
 * MSW server instance for tests.
 * Use this in your test files with:
 *
 * ```typescript
 * import { server } from './helpers/setup.js';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);

/**
 * Re-export handlers for test customization.
 */
export {
  handlers,
  successHandlers,
  errorHandlers,
  multipleAccountsHandler,
} from './msw-handlers.js';

/**
 * Re-export fixtures for test data.
 */
export * from './fixtures.js';
