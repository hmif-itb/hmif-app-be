DO $$ BEGIN
 CREATE TYPE "public"."loan_status" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_category" AS ENUM('sekre', 'properti');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_condition" AS ENUM('good', 'cant_be_used', 'lost', 'broken');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_location" AS ENUM('Sekretariat 1', 'Sekretariat 2', 'Jatinangor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_status" AS ENUM('available', 'in_use');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "peminjaman" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"property_id" text NOT NULL,
	"borrower_name" varchar(255) NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "loan_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properti" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "property_category" NOT NULL,
	"status" "property_status" DEFAULT 'available',
	"condition" "property_condition" DEFAULT 'good' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"location" text DEFAULT 'Sekretariat 1' NOT NULL,
	"photo" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_property_id_properti_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properti"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
