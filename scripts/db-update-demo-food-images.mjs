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
        new URL("../schema/update-demo-food-images.sql", import.meta.url),
        "utf8",
      ),
    );
    const result = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM restaurants) AS restaurants,
        (SELECT COUNT(DISTINCT image)::int FROM restaurants) AS restaurant_images,
        (SELECT COUNT(*)::int FROM categories) AS categories,
        (SELECT COUNT(*)::int FROM menu_items) AS menu_items,
        (SELECT COUNT(*)::int FROM restaurants WHERE image IS NULL OR image NOT LIKE '/food/%') AS restaurants_missing,
        (SELECT COUNT(*)::int FROM categories WHERE category_img IS NULL OR category_img NOT LIKE '/food/%') AS categories_missing,
        (SELECT COUNT(*)::int FROM menu_items WHERE item_img IS NULL OR item_img NOT LIKE '/food/%') AS menu_items_missing
    `);
    await client.query("COMMIT");
    const counts = result.rows[0];
    console.log(
      `Updated ${database}: ${counts.restaurants} restaurants now use ${counts.restaurant_images} distinct images; ${counts.categories} categories and ${counts.menu_items} menu items checked; non-local images remaining ${counts.restaurants_missing}/${counts.categories_missing}/${counts.menu_items_missing}.`,
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
