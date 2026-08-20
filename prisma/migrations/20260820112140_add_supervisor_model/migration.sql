/*
  Warnings:

  - You are about to drop the column `facebook` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jobRank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePhoto` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `publink` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `researchArea1` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `researchArea2` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userTitle` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NewsPost" ADD COLUMN     "supervisorId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "facebook",
DROP COLUMN "gender",
DROP COLUMN "jobRank",
DROP COLUMN "linkedin",
DROP COLUMN "phone",
DROP COLUMN "profilePhoto",
DROP COLUMN "publink",
DROP COLUMN "researchArea1",
DROP COLUMN "researchArea2",
DROP COLUMN "twitter",
DROP COLUMN "userTitle";

-- CreateTable
CREATE TABLE "Supervisor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LECTURER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userTitle" TEXT,
    "gender" TEXT,
    "jobRank" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "publink" TEXT,
    "profilePhoto" TEXT,
    "researchArea1" TEXT,
    "researchArea2" TEXT,
    "about" TEXT,
    "lecturerId" TEXT,

    CONSTRAINT "Supervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorPasswordReset" (
    "id" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisorPasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_email_key" ON "Supervisor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_lecturerId_key" ON "Supervisor"("lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorPasswordReset_token_key" ON "SupervisorPasswordReset"("token");

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervisor" ADD CONSTRAINT "Supervisor_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorPasswordReset" ADD CONSTRAINT "SupervisorPasswordReset_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
