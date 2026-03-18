# fizzy_assign_card

Toggle assignment of a user to a Fizzy card.

## Description

Assigns or unassigns a user from a card. If the user is not assigned, they will be added. If they are already assigned, they will be removed.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_number` | `number` | Yes | The card number |
| `assignee_id` | `string` | Yes | The user ID to assign/unassign |

## Returns

Returns `void` on success (HTTP 204).

## Example Usage

```
AI: I'll assign this card to John.

[Calls fizzy_assign_card with:
  card_number: 42
  assignee_id: "user_abc123"
]

Assignment toggled for user on card #42
```

## Notes

- Cards can have multiple assignees
- This is a toggle operation - calling twice removes the assignment
- Use `fizzy_list_users` to get user IDs

## Related Tools

- [fizzy_list_users](/tools/users/list-users) - Get user IDs
- [fizzy_list_cards](/tools/cards/list-cards) - Filter cards by assignee
