# fizzy_postpone_card

Move a Fizzy card to "Not Now" status.

## Description

Defers a card for later by moving it to the "Not Now" status. Use this for tasks that aren't a priority right now but shouldn't be forgotten.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to postpone |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll postpone card #42 since you want to focus on it later.

[Calls fizzy_postpone_card with card_number: 42]

Card #42 moved to Not Now
```

## When to Use

- To defer low-priority work
- When backlog items aren't immediately actionable
- To declutter the active board view

## Notes

- Postponed cards can be found with `indexed_by: "not_now"`
- Cards will automatically be postponed after inactivity (if board auto-postpone is enabled)

## Related Tools

- [fizzy_list_cards](/tools/cards/list-cards) - List postponed cards with `indexed_by: "not_now"`
- [fizzy_triage_card](/tools/cards/triage-card) - Move back to active column
