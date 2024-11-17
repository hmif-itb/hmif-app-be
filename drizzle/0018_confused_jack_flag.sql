CREATE TABLE IF NOT EXISTS "chatroom_labels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatroom_labels_many_to_many" (
	"chatroom_id" text NOT NULL,
	"label_id" text NOT NULL,
	CONSTRAINT "chatroom_labels_many_to_many_chatroom_id_label_id_pk" PRIMARY KEY("chatroom_id","label_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatroom_message_reads" (
	"user_id" text NOT NULL,
	"chatroom_message_id" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chatroom_message_reads_user_id_chatroom_message_id_pk" PRIMARY KEY("user_id","chatroom_message_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatroom_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chatroom_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reply_id" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatrooms" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_pinned_chatrooms" (
	"user_id" text NOT NULL,
	"chatroom_id" text NOT NULL,
	CONSTRAINT "user_pinned_chatrooms_user_id_chatroom_id_pk" PRIMARY KEY("user_id","chatroom_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_labels_many_to_many" ADD CONSTRAINT "chatroom_labels_many_to_many_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_labels_many_to_many" ADD CONSTRAINT "chatroom_labels_many_to_many_label_id_chatroom_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."chatroom_labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_message_reads" ADD CONSTRAINT "chatroom_message_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_message_reads" ADD CONSTRAINT "chatroom_message_reads_chatroom_message_id_chatroom_messages_id_fk" FOREIGN KEY ("chatroom_message_id") REFERENCES "public"."chatroom_messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_messages" ADD CONSTRAINT "chatroom_messages_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_messages" ADD CONSTRAINT "chatroom_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatroom_messages" ADD CONSTRAINT "chatroom_messages_reply_id_chatroom_messages_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."chatroom_messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatrooms" ADD CONSTRAINT "chatrooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_pinned_chatrooms" ADD CONSTRAINT "user_pinned_chatrooms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_pinned_chatrooms" ADD CONSTRAINT "user_pinned_chatrooms_chatroom_id_chatrooms_id_fk" FOREIGN KEY ("chatroom_id") REFERENCES "public"."chatrooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
