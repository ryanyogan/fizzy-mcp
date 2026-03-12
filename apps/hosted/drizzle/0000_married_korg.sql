CREATE TABLE `daily_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`session_id` text NOT NULL,
	`date` text NOT NULL,
	`read_count` integer DEFAULT 0 NOT NULL,
	`write_count` integer DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_daily_usage_lookup` ON `daily_usage` (`session_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_daily_usage_user_date` ON `daily_usage` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `usage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`api_key_id` text,
	`session_id` text NOT NULL,
	`fizzy_account_slug` text,
	`tool_name` text NOT NULL,
	`is_write_operation` integer NOT NULL,
	`success` integer NOT NULL,
	`error_code` text,
	`duration_ms` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_usage_user_id` ON `usage_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_usage_created_at` ON `usage_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_usage_tool_name` ON `usage_events` (`tool_name`);--> statement-breakpoint
CREATE INDEX `idx_usage_session_id` ON `usage_events` (`session_id`);