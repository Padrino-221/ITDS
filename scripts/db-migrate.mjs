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
 * If a previous deploy left a *failed* migration behind, Prisma refuses
 * to apply anything (P3009) until that row is resolved. Because every
 * migration here runs inside a single transaction, a failed migration
 * left no partial changes, so it is safe to mark it rolled back and
 * retry once with the current SQL.
 *
 * Any migration failure ultimately ABORTS the build: deploying the app
 * against an outdated schema causes cryptic P2022 errors on every page
 * instead of one clear failure here.
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

const migrateEnv = { ...process.env, DATABASE_URL: direct };

function runDeploy() {
  try {
    const out = execSync("npx prisma migrate deploy", {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
      env: migrateEnv,
    });
    if (out) process.stdout.write(out);
    return true;
  } catch (err) {
    const text = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    if (text) process.stdout.write(text);
    return { text };
  }
}

console.log(
  direct !== pooled
    ? `Migrating via direct connection (${host})…`
    : `Migrating (${host})…`
);

let result = runDeploy();

if (result !== true) {
  const failed = result.text.match(/The `([^`]+)` migration [\s\S]*?failed/);
  if (result.text.includes("P3009") && failed) {
    console.log(
      `\nFound failed migration "${failed[1]}" blocking deployments. ` +
        "It ran in a single transaction, so no partial changes exist — " +
        "marking it rolled back and retrying…"
    );
    try {
      execSync(
        `npx prisma migrate resolve --rolled-back "${failed[1]}"`,
        { stdio: "inherit", env: migrateEnv }
      );
    } catch (err) {
      console.error("Could not mark the failed migration as rolled back.");
      process.exit(err.status ?? 1);
    }
    result = runDeploy();
  }
}

if (result !== true) {
  console.error(
    "\nMigration failed — aborting build so the app never runs against an outdated schema."
  );
  process.exit(1);
}

console.log("Migrations applied.");
