export interface NotificationItem {
  id: number;
  userId: number;
  orderId: number | null;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: NotificationItem[];
  unreadCount: number;
}
