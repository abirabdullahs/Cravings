import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { listRequests, reviewRoleRequest } from "@/server/service/auth.service";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getPagination } from "../_lib";

export async function GET(request: Request) {
  try{
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? "").toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const requestedRole = url.searchParams.get("requestedRole") ?? url.searchParams.get("requested_role") ?? undefined;
  const rows = await listRequests({ status, requestedRole });
  const { page, limit, offset } = getPagination(request);
  return NextResponse.json({
    requests: rows.slice(offset, offset + limit),
    page,
    limit,
    total: rows.length,
  });
}catch(error){
  return handleApiError(error);
}
}

export async function POST(request: Request) {
  try{
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

  const rejectionReason =
    typeof payload.rejectionReason === "string"
      ? payload.rejectionReason.trim()
      : "";
  if (inputStatus === "REJECTED" && !rejectionReason) {
    return NextResponse.json(
      { error: "A rejection reason is required" },
      { status: 400 },
    );
  }

  const row = await reviewRoleRequest({
    requestId: String(payload.requestId),
    status: inputStatus,
    reviewedBy: String(session.user.id ?? ""),
    reviewNote: payload.reviewNote ?? "",
    rejectionReason,
  });

  return NextResponse.json({ request: row });
}catch(error){
  return handleApiError(error);
}
}
