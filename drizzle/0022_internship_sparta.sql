CREATE TABLE IF NOT EXISTS "internship_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "internship_departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internship_divisions" (
	"id" text PRIMARY KEY NOT NULL,
	"department_id" text NOT NULL,
	"name" text NOT NULL,
	"quota_min" integer,
	"quota_ideal" integer,
	"quota_max" integer,
	"questions" json DEFAULT '[]'::json NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internship_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"nim" text NOT NULL,
	"full_name" text NOT NULL,
	"jurusan" text NOT NULL,
	"kelas" text NOT NULL,
	"id_line" text NOT NULL,
	"pengalaman_organisasi" text,
	"kesibukan" json DEFAULT '[]'::json NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "internship_submissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internship_submission_choices" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"division_id" text NOT NULL,
	"priority_order" integer NOT NULL,
	"answers" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "internship_submission_choices_submission_id_division_id_unique" UNIQUE("submission_id","division_id"),
	CONSTRAINT "internship_submission_choices_submission_id_priority_order_unique" UNIQUE("submission_id","priority_order")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "internship_divisions" ADD CONSTRAINT "internship_divisions_department_id_internship_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."internship_departments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "internship_submissions" ADD CONSTRAINT "internship_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "internship_submission_choices" ADD CONSTRAINT "internship_submission_choices_submission_id_internship_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."internship_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "internship_submission_choices" ADD CONSTRAINT "internship_submission_choices_division_id_internship_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."internship_divisions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
