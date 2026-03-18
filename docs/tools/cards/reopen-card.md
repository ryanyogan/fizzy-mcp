# fizzy_reopen_card

Reopen a closed Fizzy card.

## Description

Reopens a previously closed card, returning it to active status.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to reopen |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll reopen card #42 so you can continue working on it.

[Calls fizzy_reopen_card with card_number: 42]

Card #42 reopened
```

## When to Use

- When closed work needs to be revisited
- To undo an accidental close
- When requirements change on completed work

## Related Tools

- [fizzy_close_card](/tools/cards/close-card) - Close a card
- [fizzy_triage_card](/tools/cards/triage-card) - Move reopened card to a column
