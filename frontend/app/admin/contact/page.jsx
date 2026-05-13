"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axiosInstance";
import { Mail, Loader2, MessageSquare, X } from "lucide-react";
import { format } from "date-fns";

export default function ContactPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/admin/contact-messages");
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Mail className="text-blue-500" /> Contact Messages
          </h1>
          <p className="text-gray-500 mt-1">Read messages submitted via the public Contact Us form.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{msg.name}</div>
                        <div className="text-xs text-gray-500">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{msg.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[250px] mt-0.5">{msg.message}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedMsg(msg)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors"
                        >
                          Read Full
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for full message */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" />
                Message Details
              </h3>
              <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">From</p>
                <div className="font-medium text-gray-900">{selectedMsg.name}</div>
                <div className="text-sm text-blue-600"><a href={`mailto:${selectedMsg.email}`}>{selectedMsg.email}</a></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                <div className="font-medium text-gray-900">{selectedMsg.subject}</div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMsg.message}
                </div>
              </div>
              <div className="pt-2 text-xs text-gray-400">
                Received on {format(new Date(selectedMsg.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
