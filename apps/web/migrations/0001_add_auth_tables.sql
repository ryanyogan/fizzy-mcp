-- Migration: Add Better Auth tables and API keys
-- This migration adds authentication tables to the existing fizzy-mcp-db database

-- Users table (Better Auth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `email_verified` integer DEFAULT false,
  `name` text,
  `image` text,
  `role` text NOT NULL DEFAULT 'user',
  `banned` integer DEFAULT false,
  `ban_reason` text,
  `ban_expires` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);

-- Sessions table (Better Auth)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `token` text NOT NULL,
  `expires_at` integer NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `impersonated_by` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `sessions_token_unique` ON `sessions` (`token`);
CREATE INDEX IF NOT EXISTS `idx_sessions_user_id` ON `sessions` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_sessions_token` ON `sessions` (`token`);

-- Accounts table (Better Auth - OAuth providers)
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `access_token_expires_at` integer,
  `scope` text,
  `id_token` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_accounts_user_id` ON `accounts` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_accounts_provider` ON `accounts` (`provider_id`, `account_id`);

-- Verifications table (Better Auth - email verification, password reset, etc.)
CREATE TABLE IF NOT EXISTS `verifications` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer,
  `updated_at` integer
);

CREATE INDEX IF NOT EXISTS `idx_verifications_identifier` ON `verifications` (`identifier`);

-- API Keys table (custom)
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `key_hash` text NOT NULL,
  `key_prefix` text NOT NULL,
  `last_used_at` integer,
  `expires_at` integer,
  `created_at` integer NOT NULL,
  `revoked_at` integer
);

CREATE INDEX IF NOT EXISTS `idx_api_keys_user_id` ON `api_keys` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_api_keys_prefix` ON `api_keys` (`key_prefix`);
