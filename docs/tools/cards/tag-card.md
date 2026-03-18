# fizzy_tag_card

Toggle a tag on a Fizzy card.

## Description

Adds or removes a tag from a card. If the tag is not on the card, it will be added. If it already exists, it will be removed.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `tag_title` | `string` | Yes | The tag title (without leading #) |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll add the "bug" tag to card #42.

[Calls fizzy_tag_card with:
  card_number: 42
  tag_title: "bug"
]

Tag "bug" toggled on card #42
```

## Notes

- Tags are created automatically if they don't exist
- This is a toggle operation - calling twice removes the tag

## Related Tools

- [fizzy_list_tags](/tools/tags/list-tags) - List available tags
- [fizzy_update_card](/tools/cards/update-card) - Set all tags at once
