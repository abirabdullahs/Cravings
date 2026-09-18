import { apiRequest } from "@/lib/http";

export interface NotificationItem {
  id: number;
  userId: number;
  orderId?: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationPayload {
  userId: number;
  orderId?: number;
  title: string;
  message: string;
}

export const fetchNotifications = async (): Promise<NotificationItem[]> =>
  apiRequest<NotificationItem[]>("/api/notifications");

export const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<NotificationItem> =>
  apiRequest<NotificationItem>("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const markNotificationRead = async (
  id: number,
): Promise<NotificationItem> =>
  apiRequest<NotificationItem>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = async (): Promise<{
  success: boolean;
}> =>
  apiRequest<{ success: boolean }>("/api/notifications", {
    method: "PATCH",
  });
