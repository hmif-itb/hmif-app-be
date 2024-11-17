ALTER TABLE "infos" ADD COLUMN "last_notified_at" timestamp with time zone DEFAULT now() NOT NULL;
