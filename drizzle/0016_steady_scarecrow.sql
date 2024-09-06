CREATE TABLE IF NOT EXISTS "info_groups" (
	"info_id" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "info_groups_info_id_role_pk" PRIMARY KEY("info_id","role")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "roles_allowed" json;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_for_info" boolean;--> statement-breakpoint
UPDATE "categories" SET "is_for_info" = true;
ALTER TABLE "categories" ALTER COLUMN "is_for_info" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "infos" ADD COLUMN "is_for_groups" boolean;--> statement-breakpoint
UPDATE "infos" SET "is_for_groups" = false;
ALTER TABLE "infos" ALTER COLUMN "is_for_groups" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_groups" ADD CONSTRAINT "info_groups_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
