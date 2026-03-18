# fizzy_unwatch_card

Unsubscribe from notifications for a Fizzy card.

## Description

Stops watching a card to no longer receive notifications about updates.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number to unwatch |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll unsubscribe you from updates on card #42.

[Calls fizzy_unwatch_card with card_number: 42]

Stopped watching card #42
```

## Related Tools

- [fizzy_watch_card](/tools/cards/watch-card) - Start watching
