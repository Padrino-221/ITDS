-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "documentName" TEXT,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "githubLink" TEXT,
ADD COLUMN     "groupMembers" TEXT,
ADD COLUMN     "objective" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "jobRank" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "publink" TEXT,
ADD COLUMN     "researchArea1" TEXT,
ADD COLUMN     "researchArea2" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "userTitle" TEXT;

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
