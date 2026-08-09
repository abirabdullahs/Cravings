import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const res = await pool.query("SELECT NOW()");
    return NextResponse.json({
      status: "Connected successfully!",
      time: res.rows[0].now,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Database connection failed", details: err.message },
      { status: 500 },
    );
  }
}
