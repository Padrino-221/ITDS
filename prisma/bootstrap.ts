/**
 * Bootstrap seed runner for deployments.
 *
 * Runs the seed in "bootstrap" mode, which only creates rows that are
 * missing and never overwrites existing production data (settings, edited
 * content, etc.). This keeps nightly / push-triggered deploys safe to run
 * against a live database, while guaranteeing a fresh database gets the full
 * baseline content the site depends on.
 *
 * Use `npm run db:seed` (plain, non-bootstrap seed) when you intentionally
 * want to reset or resync the baseline content.
 */
process.env.SEED_BOOTSTRAP = "true";

async function run(): Promise<void> {
  await import("./seed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});