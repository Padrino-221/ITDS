-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('HANDBOOK', 'STUDENT_LIST', 'OTHER');

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "category" "ResourceCategory" NOT NULL DEFAULT 'HANDBOOK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "academicYearId" TEXT,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
