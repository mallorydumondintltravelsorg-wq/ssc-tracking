"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaBell, FaCheckDouble } from "react-icons/fa";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications", {
      cache: "no-store",
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  }, []);

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(loadNotifications, 15000);

    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markAll: true,
      }),
    });

    await loadNotifications();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        aria-label="Open notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-extrabold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-extrabold">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <FaCheckDouble />
              Read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-5 text-sm font-semibold text-slate-600">
                No notifications yet.
              </div>
            )}

            {notifications.map((notification) => {
              const content = (
                <div
                  className={`border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
                    notification.readAt ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-extrabold text-slate-950">
                      {notification.title}
                    </p>
                    {!notification.readAt && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-blue-700" />
                    )}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              );

              if (notification.href) {
                return (
                  <Link key={notification.id} href={notification.href}>
                    {content}
                  </Link>
                );
              }

              return <div key={notification.id}>{content}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
