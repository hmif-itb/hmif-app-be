ALTER TABLE "comments" DROP CONSTRAINT "comments_replied_info_id_infos_id_fk";
--> statement-breakpoint
ALTER TABLE "google_subscriptions" DROP CONSTRAINT "google_subscriptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "info_angkatan" DROP CONSTRAINT "info_angkatan_info_id_infos_id_fk";
--> statement-breakpoint
ALTER TABLE "info_categories" DROP CONSTRAINT "info_categories_info_id_infos_id_fk";
--> statement-breakpoint
ALTER TABLE "info_courses" DROP CONSTRAINT "info_courses_info_id_infos_id_fk";
--> statement-breakpoint
ALTER TABLE "info_medias" DROP CONSTRAINT "info_medias_info_id_infos_id_fk";
--> statement-breakpoint
ALTER TABLE "infos" DROP CONSTRAINT "infos_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "medias" DROP CONSTRAINT "medias_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_creator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_courses" DROP CONSTRAINT "user_courses_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_read_infos" DROP CONSTRAINT "user_read_infos_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_unsubscribe_categories" DROP CONSTRAINT "user_unsubscribe_categories_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_angkatan_angkatan_year_fk";
--> statement-breakpoint
ALTER TABLE "info_courses" ALTER COLUMN "class" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_replied_info_id_infos_id_fk" FOREIGN KEY ("replied_info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "google_subscriptions" ADD CONSTRAINT "google_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_angkatan" ADD CONSTRAINT "info_angkatan_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_categories" ADD CONSTRAINT "info_categories_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_courses" ADD CONSTRAINT "info_courses_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "info_medias" ADD CONSTRAINT "info_medias_info_id_infos_id_fk" FOREIGN KEY ("info_id") REFERENCES "public"."infos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "infos" ADD CONSTRAINT "infos_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "medias" ADD CONSTRAINT "medias_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_read_infos" ADD CONSTRAINT "user_read_infos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_unsubscribe_categories" ADD CONSTRAINT "user_unsubscribe_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_angkatan_angkatan_year_fk" FOREIGN KEY ("angkatan") REFERENCES "public"."angkatan"("year") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
