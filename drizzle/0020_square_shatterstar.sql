CREATE TABLE IF NOT EXISTS "co_working_space_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"location" text,
	"address" text NOT NULL,
	"maps_url" text NOT NULL,
	"description" text,
	"creator_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "co_working_space_recommendations" ADD CONSTRAINT "co_working_space_recommendations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
