import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  getUserByEmail,
  updateOwnProfile,
  getRoleRequestForUser,
} from "@/server/service/auth.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = String(user.role ?? "customer");
  const activeRequest = await getRoleRequestForUser(String(user.id));
  const roleHistory: Record<
    string,
    Array<{ title: string; detail: string; timestamp?: string }>
  > = {
    admin: [
      {
        title: "Admin policy update",
        detail: "Reviewed platform activity",
        timestamp: new Date().toISOString(),
      },
    ],
    owner: [
      {
        title: "Restaurant activity",
        detail: "Restaurant metrics refreshed",
        timestamp: new Date().toISOString(),
      },
    ],
    rider: [
      {
        title: "Delivery activity",
        detail: "Dispatch record synchronized",
        timestamp: new Date().toISOString(),
      },
    ],
    customer: [
      {
        title: "Order activity",
        detail: "Recent cart and order history refreshed",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      role,
      created_at: user.created_at,
      account_status:
        activeRequest?.status === "APPROVED"
          ? "active"
          : (activeRequest?.status ?? "active"),
      address: "No saved address",
      history: roleHistory[role] ?? roleHistory.customer,
      application: activeRequest
        ? {
            id: activeRequest.id,
            status: activeRequest.status,
            requested_role: activeRequest.requested_role,
            source_role: activeRequest.source_role,
            verification_data: activeRequest.verification_data ?? {},
            rejection_reason: activeRequest.rejection_reason,
            created_at: activeRequest.created_at,
          }
        : null,
    },
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const updated = await updateOwnProfile({
    id: String(user.id),
    name: typeof payload.name === "string" ? payload.name : undefined,
    phone: typeof payload.phone === "string" ? payload.phone : undefined,
    profileImage:
      typeof payload.profile_image === "string"
        ? payload.profile_image
        : undefined,
  });

  return NextResponse.json({
    profile: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      profile_image: updated.profile_image,
      role: updated.role,
      created_at: updated.created_at,
      account_status: "active",
      address: "No saved address",
      history: [],
    },
  });
}
