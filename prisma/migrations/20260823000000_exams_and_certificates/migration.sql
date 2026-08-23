-- CreateEnum
CREATE TYPE "ExamQuestionType" AS ENUM ('MC', 'TF', 'CODE');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "certificatePrice" INTEGER;

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER,
    "passScore" INTEGER NOT NULL DEFAULT 70,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "type" "ExamQuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "codeLanguage" TEXT,
    "codeTemplate" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER,
    "passed" BOOLEAN,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,

    CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "paystackRef" TEXT,
    "amountPaid" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateNo" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exam_topicId_key" ON "Exam"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAttempt_examId_learnerId_startedAt_key" ON "ExamAttempt"("examId", "learnerId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_paystackRef_key" ON "Certificate"("paystackRef");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_learnerId_subjectId_key" ON "Certificate"("learnerId", "subjectId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
