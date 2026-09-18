import { toCamelCase } from "@/lib/case";
import { pool } from "@/lib/db";
import { INSERT_NOTIFICATION, FIND_NOTIFICATIONS, MARK_ALL_READ, MARK_READ } from "../query/notification.query";

export const findNotifications = async (userId: number) => {
  const result = await pool.query(FIND_NOTIFICATIONS, [userId]);
  return toCamelCase(result.rows);
};

export const insertNotification = async (userId: number, orderId: number|null, title: string, message: string) => {
  const result = await pool.query(INSERT_NOTIFICATION, [userId, orderId, title, message]);
  return toCamelCase(result.rows[0]);
};

export const markRead = async (notificationId: number) => {
  const result = await pool.query(MARK_READ, [notificationId]);
  return toCamelCase(result.rows[0]);
};

export const markAllRead = async (userId: number) => {
  const result = await pool.query(MARK_ALL_READ, [userId]);
  return toCamelCase(result.rows);
};