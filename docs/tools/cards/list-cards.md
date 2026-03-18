# fizzy_list_cards

List Fizzy cards with optional filters.

## Description

Retrieves cards from the current account with powerful filtering options. Use this to search, browse, and find cards based on various criteria.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_ids` | `string[]` | No | Filter by board ID(s) |
| `tag_ids` | `string[]` | No | Filter by tag ID(s) |
| `assignee_ids` | `string[]` | No | Filter by assignee user ID(s) |
| `indexed_by` | `string` | No | Filter by card state (see below) |
| `sorted_by` | `string` | No | Sort order (see below) |
| `terms` | `string[]` | No | Search terms to filter cards |

### Card States (`indexed_by`)

| Value | Description |
|-------|-------------|
| `all` | All open cards |
| `closed` | Completed cards |
| `not_now` | Postponed cards |
| `stalled` | Cards with no recent activity |
| `postponing_soon` | Cards about to auto-postpone |
| `golden` | Important/golden cards |

### Sort Orders (`sorted_by`)

| Value | Description |
|-------|-------------|
| `latest` | Most recently updated first |
| `newest` | Most recently created first |
| `oldest` | Oldest created first |

## Returns

```typescript
CardSummary[]
```

### CardSummary Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique card identifier |
| `number` | `number` | Human-readable card number |
| `title` | `string` | Card title |
| `status` | `string` | "drafted" or "published" |
| `description` | `string` | Plain text description |
| `golden` | `boolean` | Whether card is marked important |
| `tags` | `string[]` | Tag names on the card |
| `assignees` | `User[]` | Assigned users |
| `board` | `BoardSummary` | Parent board info |
| `created_at` | `string` | ISO 8601 timestamp |
| `last_active_at` | `string` | Last activity timestamp |
| `url` | `string` | Direct URL to the card |

## Example Usage

```
AI: Let me find all bug-tagged cards on the Engineering board.

[Calls fizzy_list_cards with:
  board_ids: ["board_abc123"]
  tag_ids: ["tag_bugs"]
  sorted_by: "latest"
]

Found 5 card(s):
1. #42 "Fix login timeout" - assigned to @john
2. #38 "Memory leak in worker" - assigned to @jane
3. #35 "API rate limiting issue" - unassigned
...
```

## When to Use

- To search for cards matching criteria
- To get an overview of work on a board
- To find cards assigned to a user
- To list cards by status (closed, postponed, etc.)

## Related Tools

- [fizzy_get_card](/tools/cards/get-card) - Get full details of a card
- [fizzy_create_card](/tools/cards/create-card) - Create a new card
- [fizzy_list_boards](/tools/boards/list-boards) - Get board IDs for filtering
- [fizzy_list_tags](/tools/tags/list-tags) - Get tag IDs for filtering
