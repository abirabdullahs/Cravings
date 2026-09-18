"use client";

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotification";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with your orders and account activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-foreground">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We will notify you when there are updates on your orders.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && markRead.mutate(item.id)}
              className={`p-4 rounded-xl border transition cursor-pointer flex justify-between items-start ${
                item.isRead
                  ? "bg-card border-border hover:bg-muted/40"
                  : "bg-primary/5 border-primary/30 hover:bg-primary/10"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.isRead ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <p className="font-semibold text-sm text-foreground">
                    {item.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pl-4 leading-relaxed">
                  {item.message}
                </p>
              </div>

              <span className="text-[11px] text-muted-foreground whitespace-nowrap pl-4">
                {new Date(item.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
