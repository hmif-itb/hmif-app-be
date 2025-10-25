DO $$ BEGIN
 CREATE TYPE "public"."laporan_status" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."jenis_peminjaman" AS ENUM('eksklusif', 'non-eksklusif');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laporan" (
	"id" text PRIMARY KEY NOT NULL,
	"properti_id" text NOT NULL,
	"pelapor_id" text NOT NULL,
	"deskripsi" text NOT NULL,
	"foto_url" text,
	"status" "laporan_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "peminjaman" ADD COLUMN "alasan" text;--> statement-breakpoint
ALTER TABLE "peminjaman" ADD COLUMN "jenis_peminjaman" "jenis_peminjaman" DEFAULT 'non-eksklusif' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laporan" ADD CONSTRAINT "laporan_properti_id_properti_id_fk" FOREIGN KEY ("properti_id") REFERENCES "public"."properti"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "laporan" ADD CONSTRAINT "laporan_pelapor_id_users_id_fk" FOREIGN KEY ("pelapor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
