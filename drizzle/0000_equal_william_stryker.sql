CREATE TABLE IF NOT EXISTS "angkatan" (
	"id" text PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "angkatan_year_unique" UNIQUE("year"),
	CONSTRAINT "angkatan_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendar_event" (
	"id" text PRIMARY KEY NOT NULL,
	"calendar_group_id" text NOT NULL,
	"courses_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"academic_year" integer,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"google_calendar_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calendar_group" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"google_calendar_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"required_push" boolean NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
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
	"type" text DEFAULT 'Elective' NOT NULL,
	"semester" integer,
	"semester_code" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"sks" integer,
	"dingdong_url" text,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"id_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"scope" text NOT NULL,
	"expires_in" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info_angkatan" (
	"info_id" text NOT NULL,
	"angkatan_id" text NOT NULL,
	CONSTRAINT "info_angkatan_info_id_angkatan_id_pk" PRIMARY KEY("info_id","angkatan_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info_categories" (
	"info_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "info_categories_info_id_category_id_pk" PRIMARY KEY("info_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info_courses" (
	"info_id" text NOT NULL,
	"course_id" text NOT NULL,
	"class" integer,
	CONSTRAINT "info_courses_info_id_course_id_pk" PRIMARY KEY("info_id","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info_medias" (
	"info_id" text NOT NULL,
	"media_id" text NOT NULL,
	CONSTRAINT "info_medias_info_id_media_id_pk" PRIMARY KEY("info_id","media_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "infos" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medias" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medias_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"keys" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE IF NOT EXISTS "testimonies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"course_id" text NOT NULL,
	"user_name" text,
	"impressions" text,
	"challenges" text,
	"advice" text,
	"overview" text,
	"assignments" text,
	"lecturer_review" text,
	"lecturer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_courses" (
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"class" integer NOT NULL,
	"semester_code_taken" text NOT NULL,
	"semester_year_taken" integer NOT NULL,
	CONSTRAINT "user_courses_user_id_course_id_pk" PRIMARY KEY("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_read_infos" (
	"user_id" text NOT NULL,
	"info_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_read_infos_user_id_info_id_pk" PRIMARY KEY("user_id","info_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_unsubscribe_categories" (
	"user_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "user_unsubscribe_categories_user_id_category_id_pk" PRIMARY KEY("user_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"nim" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"jurusan" text NOT NULL,
	"picture" text,
	"asal_kampus" text NOT NULL,
	"angkatan" integer NOT NULL,
	"jenis_kelamin" text NOT NULL,
	"status_keanggotaan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_nim_unique" UNIQUE("nim"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_calendar_group_id_calendar_group_id_fk" FOREIGN KEY ("calendar_group_id") REFERENCES "public"."calendar_group"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_courses_id_courses_id_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_replied_info_id_infos_id_fk" FOREIGN KEY ("replied_info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "google_subscriptions" ADD CONSTRAINT "google_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_angkatan" ADD CONSTRAINT "info_angkatan_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_angkatan" ADD CONSTRAINT "info_angkatan_angkatan_id_angkatan_id_fk" FOREIGN KEY ("angkatan_id") REFERENCES "public"."angkatan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_categories" ADD CONSTRAINT "info_categories_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_categories" ADD CONSTRAINT "info_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_courses" ADD CONSTRAINT "info_courses_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_courses" ADD CONSTRAINT "info_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_medias" ADD CONSTRAINT "info_medias_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_medias" ADD CONSTRAINT "info_medias_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infos" ADD CONSTRAINT "infos_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medias" ADD CONSTRAINT "medias_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
DO $$ BEGIN
 ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_read_infos" ADD CONSTRAINT "user_read_infos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_read_infos" ADD CONSTRAINT "user_read_infos_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_unsubscribe_categories" ADD CONSTRAINT "user_unsubscribe_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_unsubscribe_categories" ADD CONSTRAINT "user_unsubscribe_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_angkatan_angkatan_year_fk" FOREIGN KEY ("angkatan") REFERENCES "public"."angkatan"("year") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_replied_info_id_index" ON "comments" ("replied_info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_creator_id_index" ON "comments" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_code_index" ON "courses" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_id_index" ON "push_subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_info_id_index" ON "reactions" ("info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_comment_id_index" ON "reactions" ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonies_user_id_index" ON "testimonies" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "testimonies_course_id_index" ON "testimonies" ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_nim_index" ON "users" ("nim");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_index" ON "users" ("email");