-- Migration: Add Better Auth tables and API keys
-- This adds authentication tables to the existing database

-- Users table (Better Auth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `email_verified` integer DEFAULT false,
  `name` text,
  `image` text,
  `role` text DEFAULT 'user' NOT NULL,
  `banned` integer DEFAULT false,
  `ban_reason` text,
  `ban_expires` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
--> statement-breakpoint

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token` text NOT NULL,
  `expires_at` integer NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `impersonated_by` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sessions_token_unique` ON `sessions` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_user_id` ON `sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_sessions_token` ON `sessions` (`token`);
--> statement-breakpoint

-- Accounts table (Better Auth - OAuth providers)
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `access_token_expires_at` integer,
  `scope` text,
  `id_token` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_accounts_user_id` ON `accounts` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_accounts_provider` ON `accounts` (`provider_id`, `account_id`);
--> statement-breakpoint

-- Verifications table (Better Auth - email verification, password reset, etc.)
CREATE TABLE IF NOT EXISTS `verifications` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer,
  `updated_at` integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_verifications_identifier` ON `verifications` (`identifier`);
--> statement-breakpoint

-- API Keys table (custom)
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `name` text NOT NULL,
  `key_hash` text NOT NULL,
  `key_prefix` text NOT NULL,
  `last_used_at` integer,
  `expires_at` integer,
  `created_at` integer NOT NULL,
  `revoked_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_api_keys_user_id` ON `api_keys` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_api_keys_prefix` ON `api_keys` (`key_prefix`);
--> statement-breakpoint

-- Add api_key_id index to usage_events if not exists
CREATE INDEX IF NOT EXISTS `idx_usage_api_key_id` ON `usage_events` (`api_key_id`);
