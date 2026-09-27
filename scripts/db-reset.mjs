import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const database = process.env.PGDATABASE ?? "";
const isSafeTarget = /(?:^|[-_])(dev|development|test|local)(?:$|[-_])/i.test(database);

if (process.env.NODE_ENV === "production" || !isSafeTarget) {
  throw new Error(
    `Refusing to reset unsafe database "${database || "unknown"}". Use a database name ending in dev, test, or local.`,
  );
}

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database,
});

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await client.query(await readFile(new URL("../schema/schema.sql", import.meta.url), "utf8"));
    await client.query(await readFile(new URL("../schema/seed.sql", import.meta.url), "utf8"));
    await client.query("COMMIT");
    console.log(`Reset and seeded ${database}.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
