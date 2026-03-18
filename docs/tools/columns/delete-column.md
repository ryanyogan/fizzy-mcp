# fizzy_delete_column

Delete a column from a Fizzy board.

## Description

Permanently removes a column from a board. Cards in the column will be moved back to triage.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The board ID |
| `column_id` | `string` | Yes | The column ID |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll delete the unused column.

[Calls fizzy_delete_column with:
  board_id: "board_abc123"
  column_id: "col_xyz789"
]

Column deleted
```

## Notes

Cards in the deleted column will be moved back to triage.

## Related Tools

- [fizzy_list_columns](/tools/columns/list-columns) - List columns
- [fizzy_create_column](/tools/columns/create-column) - Create a new column
