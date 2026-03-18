# fizzy_create_column

Create a new column on a Fizzy board.

## Description

Adds a new workflow column to a board. Columns represent stages like "To Do", "In Progress", "Done".

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `board_id` | `string` | Yes | The board ID |
| `name` | `string` | Yes | The column name |
| `color` | `string` | No | Column color (see below) |

### Available Colors

| Value | Color |
|-------|-------|
| `var(--color-card-default)` | Blue |
| `var(--color-card-1)` | Gray |
| `var(--color-card-2)` | Tan |
| `var(--color-card-3)` | Yellow |
| `var(--color-card-4)` | Lime |
| `var(--color-card-5)` | Aqua |
| `var(--color-card-6)` | Violet |
| `var(--color-card-7)` | Purple |
| `var(--color-card-8)` | Pink |

## Returns

Created column object.

## Example Usage

```
AI: I'll add an "In Review" column to your board.

[Calls fizzy_create_column with:
  board_id: "board_abc123"
  name: "In Review"
  color: "var(--color-card-6)"
]

Created column "In Review"
```

## Related Tools

- [fizzy_list_columns](/tools/columns/list-columns) - List columns
- [fizzy_update_column](/tools/columns/update-column) - Update a column
