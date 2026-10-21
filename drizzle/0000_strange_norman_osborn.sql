CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`completed_at` integer,
	`progress` text DEFAULT '{}' NOT NULL,
	`clues` integer DEFAULT 0 NOT NULL,
	`score` integer,
	`grade` text,
	`messenger_hints` integer DEFAULT 0 NOT NULL,
	`phone_hints` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_completed` ON `game_sessions` (`completed_at`);--> statement-breakpoint
CREATE TABLE `raffle_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`name` text NOT NULL,
	`affiliation` text NOT NULL,
	`phone` text NOT NULL,
	`consent_version` text NOT NULL,
	`consented_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`winner` integer DEFAULT 0 NOT NULL,
	`draw_id` text,
	`drawn_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `raffle_phone_unique` ON `raffle_entries` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `raffle_session_unique` ON `raffle_entries` (`session_id`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`reset_at` integer NOT NULL
);
