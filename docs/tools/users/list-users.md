# fizzy_list_users

List all active users in the Fizzy account.

## Description

Retrieves all active users who have access to the account. Use user IDs from this list to assign cards.

## Parameters

This tool takes no parameters.

## Returns

```typescript
User[]
```

### User Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique user identifier |
| `name` | `string` | Display name |
| `email_address` | `string` | Email address |
| `role` | `string` | User role ("admin", "member") |
| `active` | `boolean` | Whether user is active |
| `avatar_url` | `string` | Profile picture URL |
| `created_at` | `string` | ISO 8601 timestamp |

## Example Usage

```
AI: Let me see who's on the team.

[Calls fizzy_list_users]

Found 4 user(s):
1. John Doe (john@example.com) - admin
2. Jane Smith (jane@example.com) - member
3. Bob Wilson (bob@example.com) - member
4. Alice Brown (alice@example.com) - member
```

## When to Use

- To get user IDs for assigning cards
- To see team members in the account
- Before assigning work

## Related Tools

- [fizzy_assign_card](/tools/cards/assign-card) - Assign user to card
- [fizzy_get_user](/tools/users/get-user) - Get user details
- [fizzy_list_cards](/tools/cards/list-cards) - Filter cards by assignee
