CREATE TABLE `preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`excluded` text DEFAULT '["玉ねぎ","にんにく"]' NOT NULL,
	`favorites` text DEFAULT '[]' NOT NULL,
	`recent` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `symptom_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`pain` integer,
	`bloating` integer,
	`stool` integer,
	`urgency` integer,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_events_user_date` ON `symptom_events` (`user_id`,`date`);--> statement-breakpoint
ALTER TABLE `meals` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `symptoms` ADD `bowel_count` integer;--> statement-breakpoint
ALTER TABLE `symptoms` ADD `urgency` integer;