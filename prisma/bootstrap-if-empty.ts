import { PrismaClient } from "@prisma/client";

/**
 * Conditional bootstrap seed runner for deployment pipelines (used by the
 * `prebuild` hook via `npm run db:bootstrap:if-empty`).
 *
 * Runs the seed in "bootstrap" mode (missing rows only, never overwrites) but
 * ONLY when the database holds no baseline content. This guarantees that a
 * push-triggered deploy never reseeds a live database:
 *
 *   - Fresh deployment (empty database) → baseline content is seeded once.
 *   - Every subsequent deploy → the count check sees existing rows, prints a
 *     message and exits without writing anything.
 *
 * If you intentionally want to reset or resync baseline content, run
 * `npm run db:bootstrap` (additive) or `npm run db:seed` (full overwrite) by
 * hand against the target database.
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  // "Has data" = any settings or staff/learner accounts exist. Both are
  // written by the very first seed, so either being present means the
  // database is already provisioned and must not be touched by deploys.
  const [settings, users] = await Promise.all([
    prisma.setting.count(),
    prisma.user.count(),
  ]);

  if (settings > 0 || users > 0) {
    console.log("Database already contains data — skipping seed on deploy.");
    return;
  }

  console.log("Empty database detected — bootstrapping baseline content…");
  process.env.SEED_BOOTSTRAP = "true";
  await import("./seed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
