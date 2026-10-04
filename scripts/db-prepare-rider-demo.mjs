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
        new URL("../schema/prepare-rider-demo.sql", import.meta.url),
        "utf8",
      ),
    );

    const targetResult = await client.query(`
      SELECT customer_order.id, customer.email, restaurant.name AS restaurant_name
      FROM rider_demo_target_order AS target
      JOIN orders AS customer_order ON customer_order.id = target.order_id
      JOIN users AS customer ON customer.id = customer_order.user_id
      JOIN restaurants AS restaurant ON restaurant.id = customer_order.restaurant_id
    `);
    const completedResult = await client.query(
      "SELECT COUNT(*)::int AS count FROM rider_demo_completed_orders",
    );
    const queueResult = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM orders AS customer_order
      JOIN deliveries AS delivery ON delivery.order_id = customer_order.id
      WHERE customer_order.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
        AND delivery.status = 'unassigned'
        AND delivery.rider_id IS NULL
    `);
    const activeResult = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM deliveries
      WHERE status IN (
        'accepted',
        'arrived_at_store',
        'picked_up',
        'arrived_at_destination'
      )
    `);

    if (targetResult.rowCount !== 1) {
      throw new Error("No unassigned order is available for the rider demo.");
    }
    if (queueResult.rows[0].count !== 1 || activeResult.rows[0].count !== 0) {
      throw new Error("The rider demo queue is not in a consistent state.");
    }

    await client.query("COMMIT");
    const target = targetResult.rows[0];
    console.log(
      `Prepared ${database}: order #${target.id} (${target.email}, ${target.restaurant_name}) is the only rider request; completed ${completedResult.rows[0].count} other open deliveries; active assigned deliveries: ${activeResult.rows[0].count}.`,
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
