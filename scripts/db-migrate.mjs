/**
 * Runs `prisma migrate deploy` against a *direct* database connection.
 *
 * Neon's pooled endpoint (host contains "-pooler") rejects Postgres
 * advisory locks, which Prisma Migrate needs to coordinate deployments
 * (error P1002). The app itself should keep using the pooler via
 * DATABASE_URL, but migrations must use the matching direct endpoint by
 * stripping the "-pooler" hostname suffix. Non-Neon hosts pass through
 * untouched.
 *
 * A failed migration ABORTS the build: deploying the app against an
 * outdated schema causes cryptic P2022 errors on every page instead of
 * one clear failure here.
 */
import { execSync } from "node:child_process";

const pooled = process.env.DATABASE_URL;
if (!pooled) {
  console.error("DATABASE_URL is not set — cannot run migrations. Aborting build.");
  process.exit(1);
}

// Neon direct endpoints share the pooler hostname without the "-pooler"
// segment: ep-xxx-pooler.REGION -> ep-xxx.REGION
const direct = pooled
  .replace("-pooler.", ".")
  .replace(/&channel_binding=[^&]*/, "");

let host = "(unparseable URL)";
try {
  host = new URL(direct).host;
} catch {}

console.log(
  direct !== pooled
    ? `Migrating via direct connection (${host})…`
    : `Migrating (${host})…`
);

try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: direct },
  });
} catch (err) {
  console.error(
    "\nMigration failed — aborting build so the app never runs against an outdated schema."
  );
  process.exit(err.status ?? 1);
}
