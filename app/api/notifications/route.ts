import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail } from "@/server/service/auth.service";
import {
  getNotifications,
  createNotification,
  markAllNotificationsRead,
} from "@/server/service/notification.service";
import { handleApiError } from "@/lib/errors/handleApiError";

// GET: Fetch all notifications for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);
    const notifications = await getNotifications(userId);
    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a notification (System, Admin, or Internal triggers)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, orderId, title, message } = body;
    const currentUser = session?.user?.email
      ? await getUserByEmail(String(session.user.email))
      : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (String(currentUser.role ?? "").toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create notifications for other users" },
        { status: 403 },
      );
    }

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields (userId, title, message)" },
        { status: 400 },
      );
    }

    const notification = await createNotification(
      Number(userId),
      orderId == null ? null : Number(orderId),
      String(title),
      String(message),
    );

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH: Mark ALL notifications as read for the authenticated user
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);
    await markAllNotificationsRead(userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
