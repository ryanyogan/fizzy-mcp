/**
 * Set of MCP tool names that are considered "write" operations
 * These count towards the daily write limit
 */
export const WRITE_OPERATIONS = new Set([
  // Boards
  'fizzy_create_board',
  'fizzy_update_board',
  'fizzy_delete_board',
  'fizzy_publish_board',
  'fizzy_unpublish_board',

  // Cards
  'fizzy_create_card',
  'fizzy_update_card',
  'fizzy_delete_card',
  'fizzy_close_card',
  'fizzy_reopen_card',
  'fizzy_postpone_card',
  'fizzy_triage_card',
  'fizzy_untriage_card',
  'fizzy_tag_card',
  'fizzy_assign_card',
  'fizzy_watch_card',
  'fizzy_unwatch_card',
  'fizzy_pin_card',
  'fizzy_unpin_card',
  'fizzy_mark_golden',
  'fizzy_unmark_golden',

  // Comments
  'fizzy_create_comment',
  'fizzy_update_comment',
  'fizzy_delete_comment',

  // Columns
  'fizzy_create_column',
  'fizzy_update_column',
  'fizzy_delete_column',

  // Steps (future)
  'fizzy_create_step',
  'fizzy_update_step',
  'fizzy_delete_step',
  'fizzy_complete_step',
  'fizzy_uncomplete_step',

  // Reactions (future)
  'fizzy_add_card_reaction',
  'fizzy_remove_card_reaction',
  'fizzy_add_comment_reaction',
  'fizzy_remove_comment_reaction',

  // Notifications (future)
  'fizzy_mark_notification_read',
  'fizzy_mark_notification_unread',
  'fizzy_mark_all_notifications_read',

  // Webhooks (future - admin only)
  'fizzy_create_webhook',
  'fizzy_update_webhook',
  'fizzy_delete_webhook',
  'fizzy_reactivate_webhook',

  // User management (future - admin only)
  'fizzy_update_user',
  'fizzy_deactivate_user',
  'fizzy_update_account_entropy',
  'fizzy_update_board_entropy',

  // Card image (future)
  'fizzy_remove_card_image',
]);

/**
 * Check if a tool name is a write operation
 */
export function isWriteOperation(toolName: string): boolean {
  return WRITE_OPERATIONS.has(toolName);
}

/**
 * Read operations (for documentation)
 */
export const READ_OPERATIONS = new Set([
  // Identity
  'fizzy_get_identity',
  'fizzy_get_account',

  // Boards
  'fizzy_list_boards',
  'fizzy_get_board',

  // Cards
  'fizzy_list_cards',
  'fizzy_get_card',

  // Comments
  'fizzy_list_comments',
  'fizzy_get_comment',

  // Columns
  'fizzy_list_columns',
  'fizzy_get_column',

  // Tags
  'fizzy_list_tags',

  // Users
  'fizzy_list_users',
  'fizzy_get_user',

  // Pins (future)
  'fizzy_list_pins',

  // Notifications (future)
  'fizzy_list_notifications',

  // Webhooks (future)
  'fizzy_list_webhooks',
  'fizzy_get_webhook',

  // Steps (future - embedded in card)
  'fizzy_get_step',

  // Reactions (future)
  'fizzy_list_card_reactions',
  'fizzy_list_comment_reactions',
]);
