CREATE TABLE IF NOT EXISTS "competition_medias" (
	"competition_id" text NOT NULL,
	"media_id" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "competition_medias_competition_id_media_id_pk" PRIMARY KEY("competition_id","media_id")
);
--> statement-breakpoint
ALTER TABLE "info_medias" ADD COLUMN "order" integer;--> statement-breakpoint
UPDATE "info_medias" SET "order" = 0;
ALTER TABLE "info_medias" ALTER COLUMN "order" SET NOT NULL;
DO $$ BEGIN
 ALTER TABLE "competition_medias" ADD CONSTRAINT "competition_medias_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_medias" ADD CONSTRAINT "competition_medias_media_id_medias_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
