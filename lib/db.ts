import { Pool, types } from "pg";

// PostgreSQL `timestamp without time zone` values in this project are written
// in UTC. node-postgres otherwise interprets them as the machine's local time,
// which made relative times about six hours old in Bangladesh.
types.setTypeParser(1114, (value) => new Date(`${value.replace(" ", "T")}Z`));

// Global type declaration to prevent multiple pool instances during Next.js hot-reloads
const globalForPg = globalThis as unknown as { pool: Pool };

export const pool =
  globalForPg.pool ||
  new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST ,
    port: Number(process.env.PGPORT) ,
    database: process.env.PGDATABASE ,
    options: "-c timezone=UTC",
  });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

