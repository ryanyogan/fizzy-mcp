# fizzy_update_column

Update a column on a Fizzy board.

## Description

Modifies the name or color of an existing column.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The board ID |
| `column_id` | `string` | Yes | The column ID |
| `name` | `string` | No | New column name |
| `color` | `string` | No | New column color |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll rename the column and change its color.

[Calls fizzy_update_column with:
  board_id: "board_abc123"
  column_id: "col_xyz789"
  name: "Code Review"
  color: "var(--color-card-7)"
]

Column updated
```

## Related Tools

- [fizzy_get_column](/tools/columns/get-column) - Get current state
- [fizzy_delete_column](/tools/columns/delete-column) - Delete the column
