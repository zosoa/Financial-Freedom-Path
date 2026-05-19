/**
 * One-off data copy: old Replit-Neon → new owner-Neon.
 *
 * Streams each row out of the source and inserts into the destination.
 * Idempotent on primary key (uses ON CONFLICT DO NOTHING) so re-running
 * is safe.
 *
 * Usage:
 *   SRC_DATABASE_URL=postgres://...  DEST_DATABASE_URL=postgres://...  node script/migrate-neon-data.mjs
 */
import pg from "pg";
const { Client } = pg;

const SRC = process.env.SRC_DATABASE_URL;
const DEST = process.env.DEST_DATABASE_URL;
if (!SRC || !DEST) {
  console.error("Set SRC_DATABASE_URL and DEST_DATABASE_URL");
  process.exit(1);
}

// Order matters for FK: parents first.
const TABLES = ["calculations", "leads"];

async function main() {
  const src = new Client({ connectionString: SRC });
  const dest = new Client({ connectionString: DEST });
  await src.connect();
  await dest.connect();

  for (const table of TABLES) {
    const { rows: srcRows } = await src.query(`SELECT * FROM ${table}`);
    if (srcRows.length === 0) {
      console.log(`${table}: 0 rows on source — skipped`);
      continue;
    }

    const cols = Object.keys(srcRows[0]);
    const colList = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const insertSql = `INSERT INTO ${table} (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`;

    let inserted = 0;
    for (const row of srcRows) {
      const values = cols.map((c) => row[c]);
      const result = await dest.query(insertSql, values);
      inserted += result.rowCount ?? 0;
    }

    const { rows: countRows } = await dest.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
    console.log(
      `${table}: source ${srcRows.length} | inserted ${inserted} | dest now ${countRows[0].c}`,
    );
  }

  await src.end();
  await dest.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
