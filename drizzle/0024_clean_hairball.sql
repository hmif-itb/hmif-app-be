-- Update null deskripsi values with default values
UPDATE "prestasi" SET "deskripsi" = 'Tidak ada deskripsi tersedia' WHERE "deskripsi" IS NULL;
--> statement-breakpoint
-- Update null bulan values with default values (assuming current month)
UPDATE "prestasi" SET "bulan" = EXTRACT(MONTH FROM CURRENT_DATE) WHERE "bulan" IS NULL;
--> statement-breakpoint
-- Update null tahun values with default values (assuming current year)
UPDATE "prestasi" SET "tahun" = EXTRACT(YEAR FROM CURRENT_DATE) WHERE "tahun" IS NULL;
--> statement-breakpoint
-- Now make required columns NOT NULL
ALTER TABLE "prestasi" ALTER COLUMN "deskripsi" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "prestasi" ALTER COLUMN "bulan" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "prestasi" ALTER COLUMN "tahun" SET NOT NULL;