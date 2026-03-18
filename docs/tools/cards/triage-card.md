# fizzy_triage_card

Move a Fizzy card into a specific column on the board.

## Description

Triages a card by moving it from the default triage area into a workflow column. This is how cards progress through stages like "To Do", "In Progress", "Done".

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to triage |
| `column_id` | `string` | Yes | The column ID to move the card into |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll move card #42 to the "In Progress" column.

[Calls fizzy_triage_card with:
  card_number: 42
  column_id: "col_abc123"
]

Card #42 triaged to column
```

## When to Use

- To move new cards into workflow columns
- To progress cards through stages
- When prioritizing work in a sprint

## Notes

- Use `fizzy_list_columns` to get available column IDs
- Cards can only be in one column at a time
- Moving to a column removes the card from "Not Now" status

## Related Tools

- [fizzy_list_columns](/tools/columns/list-columns) - Get column IDs
- [fizzy_untriage_card](/tools/cards/untriage-card) - Remove from column
- [fizzy_postpone_card](/tools/cards/postpone-card) - Move to Not Now
