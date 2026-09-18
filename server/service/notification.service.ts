import { findNotifications, insertNotification, markAllRead, markRead } from "../repository/notifications.repository";

export const getNotifications = async (userId: number) => {
  return await findNotifications(userId);
};

export const createNotification = async (userId: number, orderId: number | null, title: string, message: string) => {
  return await insertNotification(userId, orderId, title, message);
};

export const markNotificationRead = async (notificationId: number) => {
  return await markRead(notificationId);
};

export const markAllNotificationsRead = async (userId: number) => {
  return await markAllRead(userId);
};