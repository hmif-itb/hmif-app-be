ALTER TABLE "infos" ADD COLUMN "is_for_angkatan" boolean;
UPDATE "infos" SET "is_for_angkatan" = EXISTS (SELECT 1 FROM "info_angkatan" WHERE "info_angkatan"."info_id" = "infos"."id");
ALTER TABLE "infos" ALTER COLUMN "is_for_angkatan" SET NOT NULL;