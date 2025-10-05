ALTER TABLE "prestasi" ADD COLUMN "penyelenggara" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prestasi" DROP COLUMN IF EXISTS "nama_prestasi";