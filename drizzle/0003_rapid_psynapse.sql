CREATE TABLE IF NOT EXISTS "competitions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"organizer" text NOT NULL,
	"registration_start_date" timestamp with time zone,
	"registration_deadline_date" timestamp with time zone,
	"price" text,
	"source_url" text NOT NULL,
	"registration_url" text NOT NULL,
	"category" text NOT NULL
);
