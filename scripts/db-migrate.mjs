/**
 * Runs `prisma migrate deploy` against a *direct* database connection.
 *
 * Neon's pooled endpoint (host contains "-pooler") rejects Postgres
 * advisory locks, which Prisma Migrate needs to coordinate deployments
 * (error P1002). The app itself should keep using the pooler via
 * DATABASE_URL, but migrations must use the matching direct endpoint by
 * stripping the "-pooler" hostname suffix.
 */
import { execSync } from "node:child_process";

const pooled = process.env.DATABASE_URL;
if (!pooled) {
  console.error("DATABASE_URL is not set — cannot run migrations.");
  process.exit(1);
}

// Neon direct endpoints share the pooler hostname without the "-pooler"
// segment: ep-xxx-pooler.REGION -> ep-xxx.REGION
const direct = pooled.replace("-pooler.", ".");

console.log(
  direct !== pooled
    ? `Migrating via direct connection (${new URL(direct).host})…`
    : "Migrating…"
);

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: direct },
});