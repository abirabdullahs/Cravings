import { apiRequest } from "@/lib/http";
import type { NotificationItem, NotificationList } from "@/types/notification";

export type { NotificationItem } from "@/types/notification";

export interface CreateNotificationPayload {
  userId: number;
  orderId?: number;
  title: string;
  message: string;
}

export const fetchNotifications = async (): Promise<NotificationList> =>
  apiRequest<NotificationList>("/api/notifications");

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
  apiRequest<NotificationItem>(`/api/notifications/${id}`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = async (): Promise<void> =>
  apiRequest<void>("/api/notifications", {
    method: "PATCH",
  });
