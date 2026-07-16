/**
 * Rewrites ProductImage.url so every image lives on images.nivro.co.uk.
 *
 * Sources it handles:
 *   https://nivro.co.uk/wp-content/uploads/2025/10/foo.jpeg
 *   https://www.nivro.co.uk/wp-content/uploads/…
 *   http://nivro.co.uk/wp-content/uploads/…
 *   /wp-content/uploads/2025/10/foo.jpeg   (already same-origin)
 *
 * Target:
 *   https://images.nivro.co.uk/wp-content/uploads/2025/10/foo.jpeg
 *
 * Flags:
 *   --apply         actually write changes (default is dry-run)
 *   --host=XYZ      override target host (default images.nivro.co.uk)
 *   --strip-prefix  drop the leading /wp-content/uploads/ from the path
 *                   → https://images.nivro.co.uk/2025/10/foo.jpeg
 *
 * Usage:
 *   pnpm dlx tsx scripts/rewrite-image-urls.ts
 *   pnpm dlx tsx scripts/rewrite-image-urls.ts --apply
 *   pnpm dlx tsx scripts/rewrite-image-urls.ts --apply --strip-prefix
 */

import "dotenv/config";
import pg from "pg";

const LEGACY_HOSTS = new Set([
  "nivro.co.uk",
  "www.nivro.co.uk",
]);
const WP_PREFIX = "/wp-content/uploads/";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const STRIP_PREFIX = args.has("--strip-prefix");
const hostArg = process.argv.find((a) => a.startsWith("--host="));
const TARGET_HOST = hostArg ? hostArg.split("=", 2)[1] : "images.nivro.co.uk";

interface ImageRow {
  id: string;
  url: string;
}

function rewriteUrl(raw: string): string | null {
  if (!raw) return null;
  let path: string;

  if (raw.startsWith("/")) {
    path = raw;
  } else {
    try {
      const u = new URL(raw);
      // Only rewrite images that live on the legacy nivro host — leave
      // Unsplash, Cloudflare R2, BigBuy CDN etc. untouched.
      if (!LEGACY_HOSTS.has(u.host)) return null;
      path = `${u.pathname}${u.search}`;
    } catch {
      return null;
    }
  }

  if (STRIP_PREFIX && path.startsWith(WP_PREFIX)) {
    path = path.slice(WP_PREFIX.length - 1); // keep leading /
  }
  if (!path.startsWith("/")) path = `/${path}`;

  const next = `https://${TARGET_HOST}${path}`;
  return next === raw ? null : next;
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL / DIRECT_URL is not set");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  console.log(`Target host: ${TARGET_HOST}`);
  console.log(`Strip prefix: ${STRIP_PREFIX ? "yes (drop /wp-content/uploads)" : "no"}`);
  console.log(`Mode: ${APPLY ? "APPLY (writes to DB)" : "DRY RUN (no writes)"}`);
  console.log("");

  const { rows } = await client.query<ImageRow>(
    `SELECT id, url FROM "ProductImage" ORDER BY "productId", "sortOrder"`,
  );
  console.log(`Scanning ${rows.length.toLocaleString()} image rows…`);

  const updates: { id: string; url: string }[] = [];
  const skipped: Record<string, number> = {};

  for (const row of rows) {
    const next = rewriteUrl(row.url);
    if (next) {
      updates.push({ id: row.id, url: next });
    } else {
      try {
        const host = row.url.startsWith("/")
          ? "(same-origin)"
          : new URL(row.url).host;
        skipped[host] = (skipped[host] || 0) + 1;
      } catch {
        skipped["(invalid url)"] = (skipped["(invalid url)"] || 0) + 1;
      }
    }
  }

  console.log(`\nWould rewrite: ${updates.length.toLocaleString()}`);
  console.log("Skipped by host:");
  for (const [host, n] of Object.entries(skipped).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${host.padEnd(32)} ${n.toLocaleString()}`);
  }

  if (updates.length > 0) {
    console.log("\nSample of rewrites (first 5):");
    for (const u of updates.slice(0, 5)) console.log(`  ${u.id}\n    → ${u.url}`);
  }

  if (!APPLY) {
    console.log("\nDry run — re-run with --apply to write these changes.");
    await client.end();
    return;
  }

  const BATCH = 500;
  let done = 0;
  await client.query("BEGIN");
  try {
    for (let i = 0; i < updates.length; i += BATCH) {
      const batch = updates.slice(i, i + BATCH);
      const values: unknown[] = [];
      const placeholders = batch
        .map((u, idx) => {
          values.push(u.id, u.url);
          return `($${idx * 2 + 1}::text, $${idx * 2 + 2}::text)`;
        })
        .join(",");
      await client.query(
        `UPDATE "ProductImage" AS pi
            SET url = data.url
           FROM (VALUES ${placeholders}) AS data(id, url)
          WHERE pi.id = data.id`,
        values,
      );
      done += batch.length;
      process.stdout.write(`\r  updated ${done.toLocaleString()}/${updates.length.toLocaleString()}`);
    }
    await client.query("COMMIT");
    console.log(`\nDone. ${done.toLocaleString()} rows updated.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
