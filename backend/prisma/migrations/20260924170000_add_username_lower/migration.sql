-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable: add usernameLower as nullable first so existing rows don't
-- block the migration, then backfill, then tighten to NOT NULL + UNIQUE.
ALTER TABLE "User" ADD COLUMN "usernameLower" TEXT;

UPDATE "User" SET "usernameLower" = LOWER("username");

ALTER TABLE "User" ALTER COLUMN "usernameLower" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");
