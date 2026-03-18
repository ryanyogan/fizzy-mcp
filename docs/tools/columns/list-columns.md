# fizzy_list_columns

List all columns on a Fizzy board.

## Description

Retrieves all columns on a board, sorted by their display position. Columns represent workflow stages.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The board ID |

## Returns

```typescript
Column[]
```

### Column Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique column identifier |
| `name` | `string` | Column name |
| `color` | `object` | Color with `name` and `value` |
| `created_at` | `string` | ISO 8601 timestamp |

## Example Usage

```
AI: Let me see the columns on your Engineering board.

[Calls fizzy_list_columns with board_id: "board_abc123"]

Found 4 column(s):
1. "Backlog" (Blue)
2. "In Progress" (Yellow)
3. "Review" (Purple)
4. "Done" (Lime)
```

## Related Tools

- [fizzy_create_column](/tools/columns/create-column) - Add a column
- [fizzy_triage_card](/tools/cards/triage-card) - Move card to column
