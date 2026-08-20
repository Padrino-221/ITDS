/**
 * Links SPMS Supervisor accounts to their public Lecturer profiles.
 *
 * Matches by email first, then by name. Only links supervisors that
 * don't already have a lecturerId.
 *
 * Usage:
 *   node --env-file=.env scripts/link-spms-lecturers.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const supervisors = await prisma.supervisor.findMany({
    where: { lecturerId: null },
    select: { id: true, name: true, email: true },
  });

  if (supervisors.length === 0) {
    console.log("All supervisors are already linked to lecturers — nothing to do.");
    return;
  }

  const lecturers = await prisma.lecturer.findMany({
    select: { id: true, name: true, email: true },
  });

  let linked = 0;
  let skipped = 0;

  for (const sup of supervisors) {
    // Try email match first, then name match
    const match =
      lecturers.find((l) => l.email && sup.email === l.email) ||
      lecturers.find((l) => normalize(l.name) === normalize(sup.name)) ||
      lecturers.find((l) => normalize(l.name).includes(normalize(sup.name)) || normalize(sup.name).includes(normalize(l.name)));

    if (!match) {
      console.log(`  ⚠️  No lecturer match for "${sup.name}" (${sup.email}) — skipping`);
      skipped++;
      continue;
    }

    await prisma.supervisor.update({
      where: { id: sup.id },
      data: { lecturerId: match.id },
    });

    // Sync supervisor profile fields to the lecturer record
    const supFull = await prisma.supervisor.findUnique({
      where: { id: sup.id },
      select: {
        name: true,
        profilePhoto: true,
        about: true,
        researchArea1: true,
        researchArea2: true,
        userTitle: true,
        jobRank: true,
        email: true,
      },
    });

    const lecturerUpdate = {};
    if (supFull?.name) lecturerUpdate.name = supFull.name;
    if (supFull?.profilePhoto) lecturerUpdate.photo = supFull.profilePhoto;
    if (supFull?.about) lecturerUpdate.bio = supFull.about;
    if (supFull?.email) lecturerUpdate.email = supFull.email;

    const interests = [supFull?.researchArea1, supFull?.researchArea2]
      .filter(Boolean)
      .join(", ");
    if (interests) lecturerUpdate.researchInterests = interests;

    const title = [supFull?.userTitle, supFull?.jobRank].filter(Boolean).join(" ");
    if (title) lecturerUpdate.title = title;

    if (Object.keys(lecturerUpdate).length > 0) {
      await prisma.lecturer.update({
        where: { id: match.id },
        data: lecturerUpdate,
      });
    }

    console.log(`  ✅  Linked "${sup.name}" → lecturer "${match.name}" (${match.id})`);
    linked++;
  }

  console.log(`\nDone: ${linked} linked, ${skipped} skipped.`);
}

function normalize(s) {
  return (s || "").toLowerCase().replace(/[^a-z]/g, "");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
