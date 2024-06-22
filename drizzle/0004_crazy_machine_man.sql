ALTER TABLE "courses" ALTER COLUMN "semester" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "semester_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "sks" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonies" ALTER COLUMN "overview" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonies" ALTER COLUMN "assignments" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "testimonies" ALTER COLUMN "lecturer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "dingdong_url" text;--> statement-breakpoint
ALTER TABLE "testimonies" ADD COLUMN "impressions" text;--> statement-breakpoint
ALTER TABLE "testimonies" ADD COLUMN "challenges" text;--> statement-breakpoint
ALTER TABLE "testimonies" ADD COLUMN "advice" text;--> statement-breakpoint
ALTER TABLE "testimonies" ADD COLUMN "lecturer_review" text;