CREATE TABLE IF NOT EXISTS "co_working_space_reviews" (
	"coWorkingSpace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	CONSTRAINT "co_working_space_reviews_coWorkingSpace_id_user_id_pk" PRIMARY KEY("coWorkingSpace_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voucher_reviews" (
	"user_id" text NOT NULL,
	"voucher_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	CONSTRAINT "voucher_reviews_voucher_id_user_id_pk" PRIMARY KEY("voucher_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "co_working_space_reviews" ADD CONSTRAINT "co_working_space_reviews_coWorkingSpace_id_co_working_space_recommendations_id_fk" FOREIGN KEY ("coWorkingSpace_id") REFERENCES "public"."co_working_space_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "co_working_space_reviews" ADD CONSTRAINT "co_working_space_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voucher_reviews" ADD CONSTRAINT "voucher_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "voucher_reviews" ADD CONSTRAINT "voucher_reviews_voucher_id_voucher_recommendations_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher_recommendations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
