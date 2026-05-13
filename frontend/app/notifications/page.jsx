"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axiosInstance";
import { useAuthStore } from "../../store/useAuthStore";
import { Bell, CheckCircle2, Loader2, Info, X } from "lucide-react";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Optimistically update UI
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, readBy: [...n.readBy, user?._id] } : n
      ));
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      // Optimistically update UI
      setNotifications(notifications.map(n => ({
        ...n,
        readBy: n.readBy.includes(user?._id) ? n.readBy : [...n.readBy, user?._id]
      })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearNotification = async (id) => {
    try {
      await api.patch(`/notifications/${id}/clear`);
      // Optimistically remove from UI
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error("Error clearing notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.readBy.includes(user?._id)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Bell className="text-blue-500" /> Notifications
          </h1>
          <p className="text-gray-500 mt-1">Stay updated with messages and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm"
          >
            <CheckCircle2 size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">
            When you receive important updates or admin messages, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {notifications.map((notif) => {
              const isUnread = !notif.readBy.includes(user?._id);
              return (
                <li 
                  key={notif._id} 
                  className={`p-6 transition-colors ${isUnread ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-full shrink-0 ${isUnread ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Info size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className={`text-base truncate ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm leading-relaxed ${isUnread ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        {isUnread ? (
                          <button 
                            onClick={() => markAsRead(notif._id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 size={14} />
                            Mark as read
                          </button>
                        ) : (
                          <div></div> /* Empty div to push clear button to the right */
                        )}
                        <button 
                          onClick={() => clearNotification(notif._id)}
                          className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <X size={14} />
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
