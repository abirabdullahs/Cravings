import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { listRequests, reviewRoleRequest } from "@/server/service/auth.service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const requestedRole = url.searchParams.get("requestedRole") ?? url.searchParams.get("requested_role") ?? undefined;
  const rows = await listRequests({ status, requestedRole });
  return NextResponse.json({ requests: rows });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const payload = await request.json();
  const inputStatus = payload.status;
  const approved = inputStatus === "APPROVED" || inputStatus === "REJECTED";
  if (!approved || !payload.requestId) {
    return NextResponse.json({ error: "Invalid approval payload" }, { status: 400 });
  }

  const row = await reviewRoleRequest({
    requestId: String(payload.requestId),
    status: inputStatus,
    reviewedBy: String(session.user.id ?? ""),
    reviewNote: payload.reviewNote ?? "",
    rejectionReason: payload.rejectionReason ?? "",
  });

  return NextResponse.json({ request: row });
}
