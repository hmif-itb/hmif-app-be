CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE INDEX "users_full_name_idx" ON "users" USING GIST ("full_name" gist_trgm_ops);
CREATE INDEX "users_nim_idx" ON "users" USING GIST ("nim" gist_trgm_ops);
CREATE INDEX "courses_name_idx" ON "courses" USING GIST ("name" gist_trgm_ops);
CREATE INDEX "courses_code_idx" ON "courses" USING GIST ("code" gist_trgm_ops);