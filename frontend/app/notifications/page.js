'use client';

import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Bell, MessageCircle, CheckCircle, Tag, ShieldAlert, Trash2, Check } from 'lucide-react';

// Hardcoded initial data
const initialNotifications = [
  {
    id: 1,
    type: "message",
    title: "New Message from Seller",
    message: "Hi Arjun, is the BMW still available for a test drive this weekend?",
    time: "2 minutes ago",
    unread: true,
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: 2,
    type: "alert",
    title: "Ad Approved Successfully!",
    message: "Your advertisement for 'MacBook Pro 2021 M1' is now live and visible to buyers.",
    time: "1 hour ago",
    unread: true,
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    id: 3,
    type: "promotion",
    title: "50% off on Premium Ads 🎉",
    message: "Boost your listings today with our weekend special offer. Get more visibility and sell faster!",
    time: "Yesterday",
    unread: false,
    icon: Tag,
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: 4,
    type: "system",
    title: "Security Alert: New Login",
    message: "We noticed a new login from a Mac device in Warsaw. If this was you, you can ignore this message.",
    time: "2 days ago",
    unread: false,
    icon: ShieldAlert,
    color: "text-amber-500",
    bg: "bg-amber-50"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('all'); // all, unread

  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return n.unread;
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-[#046BD2] text-white text-sm font-bold px-3 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-2">Manage your alerts, messages, and account updates.</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                unreadCount > 0 
                  ? 'text-[#046BD2] bg-blue-50 hover:bg-blue-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Check size={18} />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'all' 
                ? 'border-[#046BD2] text-[#046BD2]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'unread' 
                ? 'border-[#046BD2] text-[#046BD2]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread
            {unreadCount > 0 && activeTab !== 'unread' && (
              <span className="bg-red-500 w-2 h-2 rounded-full inline-block"></span>
            )}
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-300">
                <Bell size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">You&apos;re all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div 
                    key={notification.id} 
                    className={`p-5 flex items-start gap-4 transition-all hover:bg-gray-50 group ${
                      notification.unread ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notification.bg} ${notification.color}`}>
                      <Icon size={24} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-base truncate pr-4 ${notification.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                          {notification.title}
                        </h4>
                        <span className="flex-shrink-0 text-xs font-medium text-gray-400 whitespace-nowrap pt-1">
                          {notification.time}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${notification.unread ? 'text-gray-800' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-between self-stretch sm:flex-row sm:items-center sm:gap-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                      {notification.unread && (
                        <div className="w-2.5 h-2.5 bg-[#046BD2] rounded-full sm:hidden mb-2"></div>
                      )}
                      
                      <div className="flex gap-2">
                        {notification.unread && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-[#046BD2] hover:bg-blue-50 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
