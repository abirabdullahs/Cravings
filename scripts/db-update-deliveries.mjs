import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { Pool } from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(fileURLToPath(new URL("..", import.meta.url)));

const database = process.env.PGDATABASE ?? "";
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  options: "-c timezone=UTC",
});

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      await readFile(
        new URL("../schema/seed-delivery-consistency.sql", import.meta.url),
        "utf8",
      ),
    );

    const repairedResult = await client.query(
      "SELECT COUNT(*)::int AS count FROM delivery_consistency_completed_orders",
    );
    const duplicateResult = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT rider_id
        FROM deliveries
        WHERE rider_id IS NOT NULL
          AND status IN (
            'accepted',
            'arrived_at_store',
            'picked_up',
            'arrived_at_destination'
          )
        GROUP BY rider_id
        HAVING COUNT(*) > 1
      ) AS duplicate_riders
    `);

    await client.query("COMMIT");
    console.log(
      `Updated ${database}: completed ${repairedResult.rows[0].count} duplicate active deliveries; ${duplicateResult.rows[0].count} riders still have duplicates.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
