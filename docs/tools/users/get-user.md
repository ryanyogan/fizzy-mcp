# fizzy_get_user

Get details of a specific user by ID.

## Description

Retrieves the full profile information for a single user.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | `string` | Yes | The user ID |

## Returns

```typescript
{
  id: string;
  name: string;
  email_address: string;
  role: "admin" | "member";
  active: boolean;
  avatar_url?: string;
  created_at: string;
  url: string;
}
```

## Example Usage

```
AI: Let me get John's details.

[Calls fizzy_get_user with user_id: "user_abc123"]

User: John Doe
Email: john@example.com
Role: Admin
Active: Yes
```

## Related Tools

- [fizzy_list_users](/tools/users/list-users) - List all users
- [fizzy_assign_card](/tools/cards/assign-card) - Assign to a card
