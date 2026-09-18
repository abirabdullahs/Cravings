import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationRead } from "@/server/service/notification.service"; // Adjust import path as needed
import { handleApiError } from "@/lib/errors/handleApiError";

// PATCH: Mark a single notification as read by ID
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const notificationId = Number(id);

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    const updated = await markNotificationRead(notificationId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
