# fizzy_get_column

Get a specific column by ID.

## Description

Retrieves details of a single column.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The board ID |
| `column_id` | `string` | Yes | The column ID |

## Returns

```typescript
{
  id: string;
  name: string;
  color: { name: string; value: string };
  created_at: string;
}
```

## Example Usage

```
AI: Let me get the details of that column.

[Calls fizzy_get_column with:
  board_id: "board_abc123"
  column_id: "col_xyz789"
]

Column: "In Progress" (Yellow)
```

## Related Tools

- [fizzy_list_columns](/tools/columns/list-columns) - List all columns
- [fizzy_update_column](/tools/columns/update-column) - Update the column
