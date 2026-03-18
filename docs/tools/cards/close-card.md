# fizzy_close_card

Close (complete) a Fizzy card.

## Description

Marks a card as done/complete. Closed cards are archived and no longer appear in active card lists.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to close |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll mark card #42 as complete.

[Calls fizzy_close_card with card_number: 42]

Card #42 closed
```

## When to Use

- When work on a card is finished
- To archive completed tasks
- When the user says "done" or "complete"

## Notes

- Closed cards can be found with `indexed_by: "closed"`
- Closed cards can be reopened with `fizzy_reopen_card`

## Related Tools

- [fizzy_reopen_card](/tools/cards/reopen-card) - Reopen a closed card
- [fizzy_list_cards](/tools/cards/list-cards) - List closed cards with `indexed_by: "closed"`
