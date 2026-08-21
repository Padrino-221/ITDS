-- DropForeignKey (Project.supervisorId pointed at Lecturer in the old schema;
-- it is re-pointed at Supervisor at the bottom of this migration)
ALTER TABLE "Project" DROP CONSTRAINT "Project_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "Supervisor" DROP CONSTRAINT "Supervisor_lecturerId_fkey";

-- DropIndex
DROP INDEX "Supervisor_lecturerId_key";

-- Backfill public slugs from supervisor names before the unique index lands.
-- Mirrors slugify() in src/lib/utils.ts.
ALTER TABLE "Supervisor" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';

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

-- Preserve project-supervisor assignments across the Lecturer removal:
-- translate Project.supervisorId (currently a Lecturer id) to the linked
-- Supervisor via Supervisor.lecturerId, while that link still exists.
UPDATE "Project" p
SET "supervisorId" = s."id"
FROM "Lecturer" l
JOIN "Supervisor" s ON s."lecturerId" = l."id"
WHERE p."supervisorId" = l."id";

-- DropTable (no remaining foreign keys reference Lecturer)
DROP TABLE "Lecturer";

-- Detach supervisors from lecturers now that the lookup is gone.
ALTER TABLE "Supervisor" DROP COLUMN "lecturerId";

-- Clear project links that pointed at lecturers which had no Supervisor
-- match, so the re-created foreign key below validates cleanly.
UPDATE "Project" p
SET "supervisorId" = NULL
WHERE "supervisorId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "Supervisor" s WHERE s."id" = p."supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_slug_key" ON "Supervisor"("slug");

-- AddForeignKey (re-point Project.supervisorId at Supervisor)
ALTER TABLE "Project" ADD CONSTRAINT "Project_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
