/**
 * Ensures at least one SPMS admin account exists in the database.
 *
 * Safe to run repeatedly — only creates the row if it doesn't exist.
 * Useful for existing deployments that need the SPMS admin after migration.
 *
 * Usage:
 *   node --env-file=.env scripts/seed-spms-admin.mjs
 *
 * Or with DATABASE_URL already set:
 *   node scripts/seed-spms-admin.mjs
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "spms-admin@itds.uenr.edu.gh";
  const password = "spms-admin123";

  const existing = await prisma.supervisor.findUnique({ where: { email } });
  if (existing) {
    console.log(`SPMS admin already exists (${email}) — nothing to do.`);
    return;
  }

  const passwordHash = await hash(password, 12);
  await prisma.supervisor.create({
    data: {
      name: "SPMS Administrator",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ SPMS admin account created:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change this password after first login!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
