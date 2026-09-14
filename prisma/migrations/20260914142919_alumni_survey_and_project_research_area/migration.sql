-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "researchAreaId" TEXT;

-- CreateTable
CREATE TABLE "AlumniSurveyResponse" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "graduationYear" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "employer" TEXT,
    "jobTitle" TEXT,
    "industry" TEXT,
    "preparationRating" INTEGER NOT NULL,
    "curriculumRating" INTEGER NOT NULL,
    "recommendRating" INTEGER NOT NULL,
    "skillsFeedback" TEXT,
    "feedback" TEXT,
    "willingToMentor" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlumniSurveyResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_researchAreaId_fkey" FOREIGN KEY ("researchAreaId") REFERENCES "ResearchArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Project_researchAreaId_idx" ON "Project"("researchAreaId");

-- Point the "ITDS Alumni Survey" featured link at its dedicated page instead
-- of the contact page. Only rewrites the exact seed value, so an admin-edited
-- link is left untouched.
UPDATE "Setting"
SET "value" = REPLACE("value", '"href":"/contact"', '"href":"/alumni-survey"')
WHERE "key" = 'featured_links'
  AND "value" LIKE '%ITDS Alumni Survey%'
  AND "value" LIKE '%"href":"/contact"%';
