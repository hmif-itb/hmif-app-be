ALTER TABLE "peminjaman" ADD COLUMN "borrower_id" text; --> statement-breakpoint

UPDATE "peminjaman" 
SET "borrower_id" = (
  SELECT "id" 
  FROM "users" 
  WHERE "users"."full_name" = "peminjaman"."borrower_name"
  LIMIT 1
);
--> statement-breakpoint

ALTER TABLE "peminjaman" ALTER COLUMN "borrower_id" SET NOT NULL; --> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
