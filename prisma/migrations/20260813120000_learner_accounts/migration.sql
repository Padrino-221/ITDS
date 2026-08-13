-- Learner accounts for the E-Learning Hub (/learn) are now fully separate
-- from staff panel accounts (see src/lib/learn-auth.ts).
--
-- Steps:
--   1. Create the Learner table.
--   2. Copy existing STUDENT rows from "User" into "Learner" (IDs preserved,
--      so progress rows map 1:1 without a join).
--   3. Delete any progress rows owned by staff accounts — progress is now
--      learner-owned only.
--   4. Repoint UserProgress at Learner (learnerId), replacing userId.
--   5. Remove STUDENT from the Role enum and drop the migrated student rows
--      from "User".

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- Data migration: carry existing students into the new learner table.
INSERT INTO "Learner" ("id", "name", "email", "passwordHash", "createdAt")
SELECT "id", "name", "email", "passwordHash", "createdAt"
FROM "User"
WHERE "role" = 'STUDENT';

-- Progress is learner-owned: drop rows that belonged to staff accounts.
DELETE FROM "UserProgress"
WHERE "userId" NOT IN (SELECT "id" FROM "Learner");

-- Repoint progress at Learner.
ALTER TABLE "UserProgress" ADD COLUMN "learnerId" TEXT;

UPDATE "UserProgress" SET "learnerId" = "userId";

ALTER TABLE "UserProgress" ALTER COLUMN "learnerId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_userId_fkey";

-- DropIndex
DROP INDEX "UserProgress_userId_lessonId_key";

ALTER TABLE "UserProgress" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_learnerId_lessonId_key" ON "UserProgress"("learnerId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_email_key" ON "Learner"("email");

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove the staff side of the old shared student accounts.
DELETE FROM "User" WHERE "role" = 'STUDENT';

-- Remove STUDENT from the Role enum.
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'LECTURER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::text)::"Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EDITOR';
DROP TYPE "Role_old";