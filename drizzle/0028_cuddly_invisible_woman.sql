ALTER TYPE "loan_status" ADD VALUE 'pending_return';--> statement-breakpoint
ALTER TYPE "loan_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TABLE "peminjaman" ADD COLUMN "bukti_foto_url" text;