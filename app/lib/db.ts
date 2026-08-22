import { Pool } from "pg";

// Global type declaration to prevent multiple pool instances during Next.js hot-reloads
const globalForPg = globalThis as unknown as { pool: Pool };

export const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || "cravings_db",
});

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;
