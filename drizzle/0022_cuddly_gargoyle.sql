CREATE TABLE IF NOT EXISTS "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"total_price" numeric(15, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"header" text NOT NULL,
	"footer" text NOT NULL,
	"bank_details" text NOT NULL,
	"terms" text NOT NULL,
	"default_vat_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"default_service_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "template_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "po_number" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "client_postal_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "currency" text DEFAULT 'IDR' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "subtotal" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "vat_rate" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "vat_amount" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "service_fee" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total_amount" numeric(15, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_template_id_invoice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."invoice_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "amount";