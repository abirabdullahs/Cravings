import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { submitRoleRequest, listRequests, reviewRoleRequest } from "@/server/service/auth.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const requestedRole = payload.requestedRole ?? payload.role;
  if (!requestedRole || !(["owner", "rider"].includes(String(requestedRole).toLowerCase()))) {
    return NextResponse.json({ error: "Requested role must be owner or rider" }, { status: 400 });
  }

  const row = await submitRoleRequest({
    userId: String(session.user.id),
    currentRole: String(session.user.role ?? "customer"),
    requestedRole,
    details: payload.details ?? "",
    verificationData: payload.verificationData ?? payload.verification_data ?? {},
  });

  return NextResponse.json({ request: row }, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const requestedRole = url.searchParams.get("requestedRole") ?? undefined;
  const rows = await listRequests({ status, requestedRole });
  return NextResponse.json({ requests: rows });
}
