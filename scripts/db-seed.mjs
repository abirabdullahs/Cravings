import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const database = process.env.PGDATABASE ?? "";
const isSafeTarget = /(?:^|[-_])(dev|development|test|local)(?:$|[-_])/i.test(database);

if (process.env.NODE_ENV === "production" || !isSafeTarget) {
  throw new Error(
    `Refusing to seed unsafe database "${database || "unknown"}". Use a database name ending in dev, test, or local.`,
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
  await pool.query(await readFile(new URL("../schema/seed.sql", import.meta.url), "utf8"));
  console.log(`Seeded ${database}.`);
} finally {
  await pool.end();
}
