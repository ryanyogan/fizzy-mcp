# fizzy_unmark_golden

Remove golden status from a Fizzy card.

## Description

Removes the "golden" (important) status from a card.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to unmark |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll remove the golden status from card #42.

[Calls fizzy_unmark_golden with card_number: 42]

Card #42 unmarked as golden
```

## Related Tools

- [fizzy_mark_golden](/tools/cards/mark-golden) - Mark as important
