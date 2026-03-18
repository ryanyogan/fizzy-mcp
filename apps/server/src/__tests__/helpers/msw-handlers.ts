/**
 * MSW handlers for mocking the Fizzy API.
 *
 * API Path Structure:
 * - Identity: /my/identity (global, no account slug)
 * - Account settings: /account/settings (global)
 * - Boards: /{accountSlug}/boards, /{accountSlug}/boards/{boardId}
 * - Cards: /{accountSlug}/cards, /{accountSlug}/cards/{cardNumber}
 * - Comments: /{accountSlug}/cards/{cardNumber}/comments
 * - Columns: /{accountSlug}/boards/{boardId}/columns
 * - Tags: /{accountSlug}/tags
 * - Users: /{accountSlug}/users
 */

import { http, HttpResponse } from 'msw';
import {
  testIdentity,
  testMultipleAccountsIdentity,
  testAccount,
  testBoardList,
  testBoard,
  testCardList,
  testCard,
  testCardWithColumn,
  testCommentList,
  testComment,
  testColumnList,
  testColumn,
  testTagList,
  testUserList,
  testUser,
  testBaseUrl,
  testAccessToken,
} from './fixtures.js';

/**
 * Helper to check authorization header.
 */
function isAuthorized(request: Request): boolean {
  const token = request.headers.get('Authorization');
  return token !== null && token.includes(testAccessToken);
}

/**
 * Creates handlers for successful API responses.
 */
export const successHandlers = [
  // Identity (global endpoint - no account slug)
  http.get(`${testBaseUrl}/my/identity`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testIdentity);
  }),

  // Account settings (global endpoint)
  http.get(`${testBaseUrl}/account/settings`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testAccount);
  }),

  // Boards - list
  http.get(`${testBaseUrl}/:slug/boards`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testBoardList);
  }),

  // Boards - get by ID
  http.get(`${testBaseUrl}/:slug/boards/:boardId`, ({ request, params }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Simulate not found for specific ID
    if (params.boardId === 'nonexistent') {
      return HttpResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return HttpResponse.json(testBoard);
  }),

  // Boards - create
  http.post(`${testBaseUrl}/:slug/boards`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { board?: { name?: string } };
    return HttpResponse.json(
      { ...testBoard, name: body.board?.name ?? testBoard.name },
      { status: 201 },
    );
  }),

  // Boards - update (returns 204 no content)
  http.put(`${testBaseUrl}/:slug/boards/:boardId`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Boards - delete
  http.delete(`${testBaseUrl}/:slug/boards/:boardId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Boards - publish
  http.post(`${testBaseUrl}/:slug/boards/:boardId/publication`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({
      ...testBoard,
      published: true,
      published_url: 'https://fizzy.do/boards/abc123',
    });
  }),

  // Boards - unpublish
  http.delete(`${testBaseUrl}/:slug/boards/:boardId/publication`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Cards - list (returns CardList with cards array and total_count)
  http.get(`${testBaseUrl}/:slug/cards`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testCardList);
  }),

  // Cards - get by number (returns CardSchema - detail view with column)
  http.get(`${testBaseUrl}/:slug/cards/:cardNumber`, ({ request, params }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Simulate not found for high card numbers
    if (Number(params.cardNumber) > 9999) {
      return HttpResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return HttpResponse.json(testCardWithColumn);
  }),

  // Cards - create
  http.post(`${testBaseUrl}/:slug/boards/:boardId/cards`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { card?: { title?: string } };
    return HttpResponse.json(
      { ...testCard, title: body.card?.title ?? testCard.title, number: 100 },
      { status: 201 },
    );
  }),

  // Cards - update (PUT returns Card)
  http.put(`${testBaseUrl}/:slug/cards/:cardNumber`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { card?: Record<string, unknown> };
    return HttpResponse.json({ ...testCard, ...body.card });
  }),

  // Cards - delete
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - close (POST /closure returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/closure`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - reopen (DELETE /closure returns 204)
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/closure`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - postpone (POST /not_now returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/not_now`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - triage (POST /triage returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/triage`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - untriage (DELETE /triage returns 204)
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/triage`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - tag toggle (POST /taggings returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/taggings`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - assign toggle (POST /assignments returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/assignments`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - watch (POST /watch returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/watch`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - unwatch (DELETE /watch returns 204)
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/watch`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - pin (POST /pin returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/pin`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - unpin (DELETE /pin returns 204)
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/pin`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - mark golden (POST /goldness returns 204)
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/goldness`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Card actions - unmark golden (DELETE /goldness returns 204)
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/goldness`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Comments - list
  http.get(`${testBaseUrl}/:slug/cards/:cardNumber/comments`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testCommentList);
  }),

  // Comments - get by ID
  http.get(`${testBaseUrl}/:slug/cards/:cardNumber/comments/:commentId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testComment);
  }),

  // Comments - create
  http.post(`${testBaseUrl}/:slug/cards/:cardNumber/comments`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reqBody = (await request.json()) as { comment?: { body?: string } };
    const htmlBody = reqBody.comment?.body ?? '<p>New comment</p>';
    const plainBody = htmlBody.replace(/<[^>]*>/g, '');
    return HttpResponse.json(
      {
        ...testComment,
        id: 'comment_new',
        body: { plain_text: plainBody, html: htmlBody },
      },
      { status: 201 },
    );
  }),

  // Comments - update (PATCH)
  http.patch(`${testBaseUrl}/:slug/cards/:cardNumber/comments/:commentId`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { comment?: { body?: string } };
    return HttpResponse.json({ ...testComment, body: body.comment?.body ?? testComment.body });
  }),

  // Comments - update (PUT)
  http.put(`${testBaseUrl}/:slug/cards/:cardNumber/comments/:commentId`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { comment?: { body?: string } };
    return HttpResponse.json({ ...testComment, body: body.comment?.body ?? testComment.body });
  }),

  // Comments - delete
  http.delete(`${testBaseUrl}/:slug/cards/:cardNumber/comments/:commentId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Columns - list
  http.get(`${testBaseUrl}/:slug/boards/:boardId/columns`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testColumnList);
  }),

  // Columns - get by ID
  http.get(`${testBaseUrl}/:slug/boards/:boardId/columns/:columnId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testColumn);
  }),

  // Columns - create
  http.post(`${testBaseUrl}/:slug/boards/:boardId/columns`, async ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json()) as { column?: { name?: string } };
    return HttpResponse.json(
      { ...testColumn, name: body.column?.name ?? testColumn.name, id: 'col_new' },
      { status: 201 },
    );
  }),

  // Columns - update (returns 204 no content)
  http.put(`${testBaseUrl}/:slug/boards/:boardId/columns/:columnId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Columns - delete
  http.delete(`${testBaseUrl}/:slug/boards/:boardId/columns/:columnId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Tags - list
  http.get(`${testBaseUrl}/:slug/tags`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testTagList);
  }),

  // Users - list
  http.get(`${testBaseUrl}/:slug/users`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testUserList);
  }),

  // Users - get by ID
  http.get(`${testBaseUrl}/:slug/users/:userId`, ({ request }) => {
    if (!isAuthorized(request)) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(testUser);
  }),
];

/**
 * Handler for multiple accounts identity response.
 */
export const multipleAccountsHandler = http.get(`${testBaseUrl}/my/identity`, ({ request }) => {
  if (!isAuthorized(request)) {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return HttpResponse.json(testMultipleAccountsIdentity);
});

/**
 * Handlers for error responses.
 */
export const errorHandlers = {
  unauthorized: http.get(`${testBaseUrl}/my/identity`, () => {
    return HttpResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }),

  forbidden: http.get(`${testBaseUrl}/:slug/boards/:boardId`, () => {
    return HttpResponse.json({ error: 'Access denied' }, { status: 403 });
  }),

  notFound: http.get(`${testBaseUrl}/:slug/cards/:cardNumber`, () => {
    return HttpResponse.json({ error: 'Card not found' }, { status: 404 });
  }),

  validationError: http.post(`${testBaseUrl}/:slug/boards/:boardId/cards`, () => {
    return HttpResponse.json(
      {
        error: 'Validation failed',
        issues: [{ path: ['title'], message: 'Title is required' }],
      },
      { status: 422 },
    );
  }),

  rateLimited: http.get(`${testBaseUrl}/:slug/cards`, () => {
    return HttpResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }),

  serverError: http.get(`${testBaseUrl}/:slug/cards`, () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
  }),

  networkError: http.get(`${testBaseUrl}/:slug/cards`, () => {
    return HttpResponse.error();
  }),
};

/**
 * All default handlers for a successful API.
 */
export const handlers = successHandlers;
