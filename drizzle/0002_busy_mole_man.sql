CREATE TABLE IF NOT EXISTS "google_subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"id_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"scope" text NOT NULL,
	"expires_in" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "info_medias" (
	"info_id" text,
	"media_id" text,
	CONSTRAINT "info_medias_info_id_media_id_pk" PRIMARY KEY("info_id","media_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "infos" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text,
	"content" text NOT NULL,
	"for_angkatan" integer,
	"for_matakuliah" text,
	"for_class" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medias" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medias_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_read_infos" (
	"user_id" text,
	"info_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_read_infos_user_id_info_id_pk" PRIMARY KEY("user_id","info_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nim" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jurusan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "asal_kampus" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "angkatan" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jenis_kelamin" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_keanggotaan" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "google_subscriptions" ADD CONSTRAINT "google_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_medias" ADD CONSTRAINT "info_medias_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "infos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_medias" ADD CONSTRAINT "info_medias_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "medias"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infos" ADD CONSTRAINT "infos_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medias" ADD CONSTRAINT "medias_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_read_infos" ADD CONSTRAINT "user_read_infos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_read_infos" ADD CONSTRAINT "user_read_infos_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "infos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_nim_unique" UNIQUE("nim");