DO $$ BEGIN
 CREATE TYPE "public"."competition_type" AS ENUM('CP', 'CTF', 'BCC', 'DS', 'AI', 'Hackathon');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "deskripsi" text;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "bulan" integer;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "tahun" integer;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "media_sertifikat" text;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "media_foto_awarding" text;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "media_foto_pribadi" text;--> statement-breakpoint
ALTER TABLE "prestasi" ADD COLUMN "competition_type" "competition_type";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_media_sertifikat_medias_id_fk" FOREIGN KEY ("media_sertifikat") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_media_foto_awarding_medias_id_fk" FOREIGN KEY ("media_foto_awarding") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_media_foto_pribadi_medias_id_fk" FOREIGN KEY ("media_foto_pribadi") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "penyelenggara";--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "tanggal_mulai";--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "tanggal_selesai";--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "url_sertifikat";--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "url_foto_awarding";