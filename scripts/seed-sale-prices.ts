/**
 * Marks a random subset of active products as "on sale" by setting
 * comparePrice = price × markup, so /catalog?onSale=true actually
 * shows a meaningful list.
 *
 * Flags:
 *   --apply           write changes (default is dry-run)
 *   --ratio=0.4       fraction of products to mark on sale (default 0.4)
 *   --min-markup=1.10 minimum markup on comparePrice
 *   --max-markup=1.35 maximum markup on comparePrice
 *   --reset           clear comparePrice on ALL products before seeding
 *
 * Usage:
 *   npx tsx scripts/seed-sale-prices.ts             # preview
 *   npx tsx scripts/seed-sale-prices.ts --apply     # write
 */

import "dotenv/config";
import pg from "pg";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const RESET = args.includes("--reset");

function readNumberArg(name: string, fallback: number): number {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  if (!arg) return fallback;
  const value = Number(arg.split("=", 2)[1]);
  return Number.isFinite(value) ? value : fallback;
}

const RATIO = Math.min(1, Math.max(0, readNumberArg("ratio", 0.4)));
const MIN_MARKUP = readNumberArg("min-markup", 1.1);
const MAX_MARKUP = readNumberArg("max-markup", 1.35);

function randomMarkup(): number {
  return MIN_MARKUP + Math.random() * (MAX_MARKUP - MIN_MARKUP);
}

async function main() {
  const c = new pg.Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  console.log(`Mode: ${APPLY ? "APPLY (writes to DB)" : "DRY RUN"}`);
  console.log(`Ratio: ${RATIO} · markup: ${MIN_MARKUP}–${MAX_MARKUP}`);
  if (RESET) console.log(`Reset: yes — comparePrice cleared on all rows first`);
  console.log("");

  const { rows } = await c.query<{ id: string; price: string }>(
    `SELECT id, price::text
       FROM "Product"
      WHERE status = 'ACTIVE'
        AND price IS NOT NULL
        AND price > 0`,
  );

  const targets: { id: string; comparePrice: number }[] = [];
  for (const row of rows) {
    if (Math.random() >= RATIO) continue;
    const price = Number(row.price);
    if (!Number.isFinite(price) || price <= 0) continue;
    const compare = Math.round(price * randomMarkup() * 100) / 100;
    if (compare <= price) continue;
    targets.push({ id: row.id, comparePrice: compare });
  }

  console.log(`Scanned ${rows.length} active products`);
  console.log(`Will mark on sale: ${targets.length}`);
  console.log("Sample of 5:");
  for (const t of targets.slice(0, 5)) {
    console.log(`  ${t.id}  comparePrice → ${t.comparePrice.toFixed(2)}`);
  }

  if (!APPLY) {
    console.log("\nDry run — pass --apply to write.");
    await c.end();
    return;
  }

  await c.query("BEGIN");
  try {
    if (RESET) {
      const cleared = await c.query(
        `UPDATE "Product" SET "comparePrice" = NULL WHERE "comparePrice" IS NOT NULL`,
      );
      console.log(`\nCleared comparePrice on ${cleared.rowCount} rows`);
    }

    const BATCH = 400;
    let done = 0;
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((t, idx) => {
          values.push(t.id, t.comparePrice);
          return `($${idx * 2 + 1}::text, $${idx * 2 + 2}::numeric)`;
        })
        .join(",");
      await c.query(
        `UPDATE "Product" AS p
            SET "comparePrice" = data.compare
           FROM (VALUES ${placeholders}) AS data(id, compare)
          WHERE p.id = data.id`,
        values,
      );
      done += batch.length;
      process.stdout.write(`\r  updated ${done}/${targets.length}`);
    }
    await c.query("COMMIT");
    console.log(`\nDone. ${done} rows marked on sale.`);
  } catch (err) {
    await c.query("ROLLBACK");
    throw err;
  } finally {
    await c.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
