import { pool } from "@/lib/db";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

export async function withTransaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// The course rubric requires explicit transaction control even for one-statement
// mutations. Reads should continue to use pool.query directly.
export async function executeDml<
  Row extends QueryResultRow = QueryResultRow,
>(query: string, values?: unknown[]): Promise<QueryResult<Row>> {
  return withTransaction((client) => client.query<Row>(query, values));
}

