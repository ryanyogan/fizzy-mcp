// Re-export all schema from shared package
// This ensures both apps use the same schema definitions
export {
  // Auth tables
  users,
  sessions,
  accounts,
  verifications,
  apiKeys,
  // App tables
  settings,
  usageEvents,
  dailyUsage,
  // Types
  type User,
  type NewUser,
  type Session,
  type NewSession,
  type Account,
  type NewAccount,
  type Verification,
  type NewVerification,
  type ApiKey,
  type NewApiKey,
  type Settings,
  type NewSettings,
  type UsageEvent,
  type NewUsageEvent,
  type DailyUsage,
  type NewDailyUsage,
} from '@fizzy-mcp/shared/db';
