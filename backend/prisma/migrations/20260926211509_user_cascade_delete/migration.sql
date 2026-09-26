-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
