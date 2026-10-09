CREATE TABLE `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`kind` text NOT NULL,
	`food` text NOT NULL,
	`amount` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_meals_user_date` ON `meals` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `symptoms` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`pain` integer,
	`bloating` integer,
	`stool` integer,
	`stress` integer,
	`sleep` real,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_symptoms_user_date` ON `symptoms` (`user_id`,`date`);