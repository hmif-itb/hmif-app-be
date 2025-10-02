DO $$ BEGIN
 CREATE TYPE "public"."jenis_prestasi" AS ENUM('organisasi', 'kepanitiaan', 'kompetisi');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prestasi" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"jenis_prestasi" "jenis_prestasi" NOT NULL,
	"nama_prestasi" text NOT NULL,
	"penyelenggara" text NOT NULL,
	"tanggal_mulai" timestamp with time zone NOT NULL,
	"tanggal_selesai" timestamp with time zone NOT NULL,
	"url_sertifikat" text NOT NULL,
	"url_foto_awarding" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
