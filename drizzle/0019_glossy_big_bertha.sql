CREATE TABLE IF NOT EXISTS "voucher_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"link" text,
	"start_period" timestamp with time zone,
	"end_period" timestamp with time zone,
	"description" text,
	"creator_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voucher_recommendations" ADD CONSTRAINT "voucher_recommendations_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
