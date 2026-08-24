import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await pool.query("SELECT NOW()");
    return NextResponse.json({
      status: "Connected successfully!",
      time: res.rows[0].now,
    });
  } catch (err: unknown) {
    const details =
      err instanceof Error ? err.message : "Unknown database error";
    return NextResponse.json(
      { error: "Database connection failed", details },
      { status: 500 },
    );
  }
}
