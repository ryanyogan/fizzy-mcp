# fizzy_pin_card

Pin a Fizzy card for quick access.

## Description

Pins a card to make it easily accessible. Pinned cards appear prominently in the UI.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to pin |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll pin card #42 so you can find it quickly.

[Calls fizzy_pin_card with card_number: 42]

Card #42 pinned
```

## Related Tools

- [fizzy_unpin_card](/tools/cards/unpin-card) - Unpin a card
- [fizzy_mark_golden](/tools/cards/mark-golden) - Mark as important
