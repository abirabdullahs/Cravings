import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const res = await pool.query("SELECT NOW()");
    return NextResponse.json({
      status: "Connected successfully!",
      time: res.rows[0].now,
    });
  } catch {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}
