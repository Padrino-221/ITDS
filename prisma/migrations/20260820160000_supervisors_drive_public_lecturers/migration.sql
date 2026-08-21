-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "Supervisor" DROP CONSTRAINT "Supervisor_lecturerId_fkey";

-- DropIndex
DROP INDEX "Supervisor_lecturerId_key";

-- AlterTable
ALTER TABLE "Supervisor" DROP COLUMN "lecturerId",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- Backfill public slugs from supervisor names before the unique index lands.
-- Mirrors slugify() in src/lib/utils.ts.
UPDATE "Supervisor"
SET "slug" = COALESCE(
  NULLIF(regexp_replace(btrim(regexp_replace(lower("name"), '[^a-z0-9\s-]', '', 'g')), '[\s_]+', '-', 'g'), ''),
  'lecturer'
);

-- Ensure empty/duplicate slugs don't collide (uniqueness is enforced below).
WITH numbered AS (
  SELECT "id", "slug", row_number() OVER (PARTITION BY "slug" ORDER BY "createdAt") AS rn
  FROM "Supervisor"
)
UPDATE "Supervisor" s
SET "slug" = s."slug" || '-' || numbered.rn
FROM numbered
WHERE numbered."id" = s."id" AND numbered.rn > 1;

-- DropTable
DROP TABLE "Lecturer";

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_slug_key" ON "Supervisor"("slug");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;