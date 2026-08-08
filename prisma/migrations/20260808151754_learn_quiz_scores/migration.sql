-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bestScore" INTEGER,
ADD COLUMN     "bestScoreTotal" INTEGER,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3);
