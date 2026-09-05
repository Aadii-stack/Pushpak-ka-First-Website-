'use client';

import React, { useState, useEffect } from 'react';
import { FoodBridgeStore } from '@/lib/store';
import { AppNotification, User } from '@/lib/types';
import { Bell, Check, CheckCheck, Package, Truck, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = () => {
    const user = FoodBridgeStore.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const list = FoodBridgeStore.getNotifications(user.id);
      setNotifications(list);
    }
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('foodbridge_state_change', loadNotifications);
    return () => window.removeEventListener('foodbridge_state_change', loadNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    FoodBridgeStore.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      FoodBridgeStore.markAllNotificationsRead(currentUser.id);
      loadNotifications();
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'tie_up_request':
      case 'tie_up_accepted':
      case 'listing_expiring':
        return <Package className="w-4 h-4 text-accent-primary" />;
      case 'driver_en_route':
      case 'food_picked_up':
      case 'food_delivered':
        return <Truck className="w-4 h-4 text-accent-trust" />;
      case 'issue_flagged':
        return <AlertTriangle className="w-4 h-4 text-accent-alert" />;
      case 'verification_status':
        return <ShieldCheck className="w-4 h-4 text-accent-trust" />;
      default:
        return <Bell className="w-4 h-4 text-ink-muted" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[44px] min-w-[44px] relative flex items-center justify-center rounded-xl text-ink-muted hover:text-ink hover:bg-white/70 transition-colors border border-transparent hover:border-white/80"
        title="Notifications"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_16px_40px_rgba(34,40,43,0.14)] border border-white z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-4 bg-ink text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-accent-primary" />
                <span className="font-serif font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary text-[11px] font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-stone-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-ink-muted text-xs">
                  No notifications yet. You're all caught up!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors ${
                      notif.read ? 'bg-white/60 hover:bg-white' : 'bg-accent-primary-subtle/50 hover:bg-accent-primary-subtle/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white shadow-xs mt-0.5 flex-shrink-0 border border-stone-100">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-semibold text-ink truncate">{notif.title}</h4>
                          <span className="text-[10px] text-ink-light whitespace-nowrap">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted leading-relaxed mb-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          {notif.link ? (
                            <Link
                              href={notif.link}
                              onClick={() => {
                                FoodBridgeStore.markNotificationRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-primary-hover"
                            >
                              Open details
                            </Link>
                          ) : (
                            <span />
                          )}
                          {!notif.read && (
                            <button
                              onClick={(e) => handleMarkRead(notif.id, e)}
                              className="text-[11px] text-ink-muted hover:text-ink flex items-center gap-1 min-h-[36px]"
                            >
                              <Check className="w-3 h-3" /> Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
