CREATE TABLE IF NOT EXISTS "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"replied_info_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"curriculum_year" integer NOT NULL,
	"jurusan" text NOT NULL,
	"semester" integer NOT NULL,
	"semester_code" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"sks" integer NOT NULL,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"info_id" text,
	"comment_id" text,
	"reaction" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_creator_id_info_id_comment_id_unique" UNIQUE NULLS NOT DISTINCT("creator_id","info_id","comment_id")
);
--> statement-breakpoint
ALTER TABLE "infos" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "jurusan" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "asal_kampus" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_replied_info_id_infos_id_fk" FOREIGN KEY ("replied_info_id") REFERENCES "public"."infos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_replied_info_id_index" ON "comments" ("replied_info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_creator_id_index" ON "comments" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_code_index" ON "courses" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_info_id_index" ON "reactions" ("info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_comment_id_index" ON "reactions" ("comment_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infos" ADD CONSTRAINT "infos_for_matakuliah_courses_code_fk" FOREIGN KEY ("for_matakuliah") REFERENCES "public"."courses"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_nim_index" ON "users" ("nim");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_index" ON "users" ("email");