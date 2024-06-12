CREATE TABLE IF NOT EXISTS "testimonies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"course_id" text NOT NULL,
	"user_name" text,
	"content" text NOT NULL,
	"assignments" text NOT NULL,
	"lecturer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "type" text DEFAULT 'Elective' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonies_user_id_index" ON "testimonies" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonies_course_id_index" ON "testimonies" ("course_id");