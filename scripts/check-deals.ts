import "dotenv/config";
import pg from "pg";

async function main() {
  const c = new pg.Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const total = await c.query(
    `SELECT count(*)::int AS n FROM "Product" WHERE status = 'ACTIVE'`,
  );
  const withCompare = await c.query(
    `SELECT count(*)::int AS n FROM "Product"
      WHERE status = 'ACTIVE'
        AND "comparePrice" IS NOT NULL
        AND "comparePrice" > 0`,
  );
  const withImg = await c.query(
    `SELECT count(*)::int AS n FROM "Product" p
      WHERE status = 'ACTIVE'
        AND EXISTS (SELECT 1 FROM "ProductImage" pi WHERE pi."productId" = p.id)`,
  );
  const onSaleAndImg = await c.query(
    `SELECT count(*)::int AS n FROM "Product" p
      WHERE status = 'ACTIVE'
        AND "comparePrice" IS NOT NULL
        AND "comparePrice" > 0
        AND EXISTS (SELECT 1 FROM "ProductImage" pi WHERE pi."productId" = p.id)`,
  );
  console.log("Active products total:", total.rows[0].n);
  console.log("  with comparePrice > 0 (on sale):", withCompare.rows[0].n);
  console.log("  with images:", withImg.rows[0].n);
  console.log("  on sale AND with images:", onSaleAndImg.rows[0].n);
  await c.end();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
