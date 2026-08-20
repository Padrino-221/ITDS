/*
  Warnings:

  - You are about to drop the column `supervisorId` on the `NewsPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "NewsPost" DROP CONSTRAINT "NewsPost_supervisorId_fkey";

-- AlterTable
ALTER TABLE "NewsPost" DROP COLUMN "supervisorId";
