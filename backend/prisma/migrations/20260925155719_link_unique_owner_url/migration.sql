/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,originalUrl]` on the table `Link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Link_ownerId_originalUrl_key" ON "Link"("ownerId", "originalUrl");
