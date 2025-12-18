"use client";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Bell, Info, Shield, Mail, MessageSquare } from "lucide-react";
import {
  useNotificationsList,
  useMarkNotificationAsRead,
} from "@/controller/query/notifications/useNotifications";
import { Notification } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Tenter de charger les vraies notifications
  // Désactiver temporairement car l'endpoint /notifications/list n'existe pas encore (404)
  // TODO: Réactiver quand l'endpoint sera disponible dans le backend
  const {
    data: notificationsResponse,
    isLoading,
    isError,
    refetch,
  } = useNotificationsList(
    {
      page: 1,
      per_page: 5,
      read: false, // Seulement les non lues pour le dropdown
    },
    apiKey,
    false // Désactivé temporairement pour éviter les erreurs 404
  );

  const markAsReadMutation = useMarkNotificationAsRead();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && notification.id && apiKey) {
      try {
        await markAsReadMutation.mutateAsync({
          data: { notification_id: notification.id },
          apiKey,
        });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        // Refetch silencieux - ne pas bloquer si le backend n'existe pas
        refetch?.().catch(() => {
          // Erreur silencieuse
        });
      } catch {
        // Erreur silencieuse - le backend peut ne pas exister
      }
    }
  };

  // Utiliser uniquement les vraies données - pas de fake data
  const notifications = useMemo(() => {
    // Si erreur ou pas de données, retourner tableau vide
    if (isError || !notificationsResponse) {
      return [] as Notification[];
    }

    if (!isLoading && notificationsResponse) {
      const data =
        notificationsResponse.notifications ||
        notificationsResponse.message?.notifications ||
        notificationsResponse.message?.data ||
        notificationsResponse.data?.notifications ||
        notificationsResponse.data?.data ||
        [];
      if (Array.isArray(data) && data.length > 0) {
        return data as Notification[];
      }
    }

    // Pas de fake data - retourner tableau vide si pas de vraies données
    return [] as Notification[];
  }, [notificationsResponse, isLoading, isError]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read || n.read === 0).length;
  }, [notifications]);

  const notifying = unreadCount > 0;
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function closeDropdown() {
    setIsOpen(false);
  }
  const handleClick = () => {
    toggleDropdown();
  };
  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-200/50 bg-white/50 text-gray-600 backdrop-blur-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-800/50 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
        onClick={handleClick}
        aria-label="Toggle notifications dropdown"
        title="Notifications"
      >
        <span
          className={`absolute right-1 top-1 z-10 h-2.5 w-2.5 rounded-full bg-brand-500 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75"></span>
        </span>
        <Bell className="h-5 w-5" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-[400px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-brand-50/50 to-blue-light-50/50 px-5 py-4 dark:border-gray-800 dark:from-brand-950/30 dark:to-blue-light-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-2 shadow-md">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h5>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleDropdown}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close notifications dropdown"
            title="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.slice(0, 5).length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.slice(0, 5).map((item) => {
                const isUnread = !item.read || item.read === 0;
                return (
                  <li key={item.id || `notification-${Math.random()}`}>
                    <DropdownItem
                      onItemClick={() => {
                        handleNotificationClick(item);
                        closeDropdown();
                      }}
                      className={`group flex gap-3 px-4 py-4 transition-colors ${
                        isUnread
                          ? "bg-gradient-to-r from-brand-50/30 to-white hover:from-brand-50/50 hover:to-gray-50 dark:from-brand-500/10 dark:to-gray-900 dark:hover:from-brand-500/20 dark:hover:to-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } cursor-pointer`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105 ${
                          item.type === "security"
                            ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            : item.type === "email"
                              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              : item.type === "sms"
                                ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                : item.type === "system"
                                  ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                  : "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                        }`}
                      >
                        {item.type === "security" ? (
                          <Shield className="h-5 w-5" />
                        ) : item.type === "email" ? (
                          <Mail className="h-5 w-5" />
                        ) : item.type === "sms" ? (
                          <MessageSquare className="h-5 w-5" />
                        ) : item.type === "system" ? (
                          <Info className="h-5 w-5" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p
                                className={`truncate text-sm font-semibold text-gray-900 dark:text-white ${
                                  isUnread ? "font-bold" : "font-medium"
                                }`}
                              >
                                {item.title || "Notification"}
                              </p>
                              {isUnread && (
                                <div className="h-2 w-2 shrink-0 rounded-full bg-brand-500"></div>
                              )}
                            </div>
                            <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                              {item.message || item.title || "No message"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {(() => {
                              const date = new Date(
                                item.createdAt || item.created_at || new Date()
                              );
                              const now = new Date();
                              const diff = now.getTime() - date.getTime();
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const days = Math.floor(hours / 24);

                              if (hours < 1) return "Just now";
                              if (hours < 24) return `${hours}h ago`;
                              if (days < 7) return `${days}d ago`;
                              return date.toLocaleDateString();
                            })()}
                          </span>
                        </div>
                      </div>
                    </DropdownItem>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="mb-3 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <Bell className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
              <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                You&apos;re all caught up!
              </p>
            </div>
          )}
        </div>

        {/* Footer with View All Button */}
        <div className="border-t border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
          <Link
            href="/notifications"
            className="block w-full rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:from-brand-600 hover:to-brand-700 hover:shadow-md dark:border-brand-700"
            onClick={closeDropdown}
          >
            View All Notifications
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
