import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ role: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await params;
  const requestedRole = role.toLowerCase();
  if (!["admin", "owner", "rider", "customer"].includes(requestedRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const currentRole = String(session.user.role ?? "customer").toLowerCase();
  if (currentRole !== requestedRole && currentRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stats: Record<string, Record<string, number | string>> = {
    admin: { overview: 1, users: 12, restaurants: 6, riders: 2, orders: 47, payments: 8200, reviews: 21, notifications: 4, requests: 3, reports: 8, profile: 1 },
    owner: { overview: 1, restaurants: 2, menu: 18, orders: 13, sales: 12600, reviews: 9, notifications: 3, profile: 1, activity: 7 },
    rider: { overview: 1, deliveries: 8, assigned: 2, active: 1, history: 3, earnings: 540, notifications: 2, profile: 1, activity: 5 },
    customer: { overview: 1, orders: 6, history: 7, addresses: 4, cart: 2, payments: 3, reviews: 5, coupons: 2, notifications: 1, profile: 1, activity: 8 },
  };

  return NextResponse.json({ stats: stats[requestedRole] ?? {} });
}
