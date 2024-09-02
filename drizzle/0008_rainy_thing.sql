ALTER TABLE "competitions" DROP COLUMN "category";
ALTER TABLE "competitions" ADD COLUMN "categories" json NOT NULL DEFAULT '[]'::json;