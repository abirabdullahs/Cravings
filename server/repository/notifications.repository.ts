import { toCamelCase } from "@/lib/case";
import { pool } from "@/lib/db";
import { executeDml } from "@/lib/dblib";
import {
  INSERT_NOTIFICATION,
  FIND_NOTIFICATIONS,
  MARK_ALL_READ,
  MARK_READ,
  COUNT_UNREAD_NOTIFICATIONS,
} from "../query/notification.query";
import type { NotificationList } from "@/types/notification";

export const findNotifications = async (
  userId: number,
): Promise<NotificationList> => {
  const [items, count] = await Promise.all([
    pool.query(FIND_NOTIFICATIONS, [userId]),
    pool.query(COUNT_UNREAD_NOTIFICATIONS, [userId]),
  ]);
  return {
    items: toCamelCase(items.rows),
    unreadCount: Number(count.rows[0]?.unread_count ?? 0),
  };
};

export const insertNotification = async (
  userId: number,
  orderId: number | null,
  title: string,
  message: string,
) => {
  const result = await executeDml(INSERT_NOTIFICATION, [
    userId,
    orderId,
    title,
    message,
  ]);
  return toCamelCase(result.rows[0]);
};

export const markRead = async (notificationId: number, userId: number) => {
  const result = await executeDml(MARK_READ, [notificationId, userId]);
  return toCamelCase(result.rows[0]);
};

export const markAllRead = async (userId: number) => {
  await executeDml(MARK_ALL_READ, [userId]);
};
