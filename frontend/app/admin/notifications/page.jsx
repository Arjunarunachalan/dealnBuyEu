"use client";

import { useState } from "react";
import api from "../../../lib/axiosInstance";
import { Bell, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setSuccess(false);
    try {
      const { data } = await api.post("/admin/notifications/send", {
        title,
        message
      });

      if (data.success) {
        setSuccess(true);
        setTitle("");
        setMessage("");
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Bell className="text-orange-500" /> Push Notification
          </h1>
          <p className="text-gray-500 mt-1">Broadcast an in-app notification to all active users in your region.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 flex items-start gap-3">
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-green-800">Notification Sent!</h3>
              <p className="text-green-700 text-sm mt-1">Your message has been successfully broadcasted and will appear in users' navbars.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Sale is Live!"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Body
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              required
            />
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSending || !title || !message}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Broadcast Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
