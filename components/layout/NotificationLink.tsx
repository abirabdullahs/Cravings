"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationLink() {
  const { data } = useNotifications();
  const unreadCount = data?.unreadCount ?? 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      className="relative flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
    >
      <Bell className="size-4" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-5 text-destructive-foreground">
          {badgeLabel}
        </span>
      )}
    </Link>
  );
}
