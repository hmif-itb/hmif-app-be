ALTER TABLE "comments" ALTER COLUMN "replied_info_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "infos" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "creator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "id" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_replied_info_id_index" ON "comments" ("replied_info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_creator_id_index" ON "comments" ("creator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_code_index" ON "courses" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_info_id_index" ON "reactions" ("info_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reactions_comment_id_index" ON "reactions" ("comment_id");