CREATE TABLE `user_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`category` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_foods_user_name` ON `user_foods` (`user_id`,`name_key`);