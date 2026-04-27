"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useChatStore from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { MessageCircle, Send, ChevronRight, Package, ArrowLeft } from "lucide-react";

// Helper: get the other participant (not the logged-in user)
const getOtherParticipant = (participants, myId) => {
  if (!participants || !myId) return null;
  return participants.find((p) => {
    const pId = p._id?.toString() || p?.toString();
    return pId !== myId?.toString();
  });
};

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    initSocket,
    fetchConversations,
    setActiveConversation,
    sendMessage,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const socketInitialized = useRef(false);

  // Socket init — run ONCE per login session, never disconnect on unmount
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/registration_login");
      return;
    }
    if (user?._id && !socketInitialized.current) {
      socketInitialized.current = true;
      initSocket(user._id);
    }
  }, [user, isLoggedIn]);

  // Fetch conversations when page loads
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      fetchConversations();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const receiver = getOtherParticipant(activeConversation.participants, user?._id);
    if (!receiver) return;

    const receiverId = receiver._id || receiver;
    const trimmedText = messageText.trim();

    // Optimistic UI — show message immediately without waiting for socket echo
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      conversationId: activeConversation._id,
      sender: user._id,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };
    useChatStore.setState((s) => ({ messages: [...s.messages, optimisticMsg] }));

    sendMessage(trimmedText, receiverId);
    setMessageText("");
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileChatOpen(true);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F3F4F6]">
      <Navbar />

      {/* Chat container — fills remaining viewport, never overflows */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-[1200px] mx-auto w-full px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2 flex-shrink-0">
          <MessageCircle size={22} className="text-[#046BD2]" />
          Messages
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden flex-1 min-h-0">

          {/* ── Left Sidebar: Conversation List ── */}
          <div className={`w-full lg:w-[340px] flex-shrink-0 border-r border-gray-100 flex flex-col min-h-0 ${mobileChatOpen ? "hidden lg:flex" : "flex"}`}>
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Conversations</p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
              {isLoading && conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                  <div className="w-6 h-6 border-2 border-[#046BD2] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3 px-6 text-center">
                  <MessageCircle size={36} className="opacity-30" />
                  <p className="text-sm">No conversations yet.<br />Chat with a seller to get started.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv.participants, user?._id);
                  const isActive = activeConversation?._id === conv._id;
                  const displayName = other?.pseudoName || other?.name || "User";
                  const initial = displayName.charAt(0).toUpperCase();
                  const postTitle = conv.post?.title || "Item";
                  const lastMsg = conv.lastMessage?.text || "No messages yet";

                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150 ${
                        isActive
                          ? "bg-blue-50 border-l-4 border-l-[#046BD2]"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ${isActive ? "bg-[#046BD2]" : "bg-gray-400"}`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{formatTime(conv.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Package size={11} className="text-[#046BD2] flex-shrink-0" />
                          <p className="text-[11px] text-[#046BD2] font-medium truncate">{postTitle}</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Pane: Chat Window ── */}
          <div className={`flex-1 flex flex-col min-h-0 min-w-0 ${mobileChatOpen ? "flex" : "hidden lg:flex"}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                {(() => {
                  const other = getOtherParticipant(activeConversation.participants, user?._id);
                  const displayName = other?.pseudoName || other?.name || "User";
                  const initial = displayName.charAt(0).toUpperCase();
                  const postTitle = activeConversation.post?.title || "Item";
                  const postPrice = activeConversation.post?.price;

                  return (
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                      <button
                        onClick={() => { setMobileChatOpen(false); setActiveConversation(null); }}
                        className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 -ml-1 mr-1"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-[#046BD2] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-[15px] leading-tight">{displayName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Package size={12} className="text-[#046BD2]" />
                          <p className="text-[12px] text-[#046BD2] font-medium truncate">{postTitle}</p>
                          {postPrice && <span className="text-[12px] text-gray-400 font-medium">· €{postPrice.toLocaleString()}</span>}
                        </div>
                      </div>
                      {activeConversation.post?.images?.[0] && (
                        <img
                          src={activeConversation.post.images[0]}
                          alt={postTitle}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                      )}
                    </div>
                  );
                })()}

                {/* Messages Area — ONLY this scrolls */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-[#F7F9FB] min-h-0">
                  {isLoading ? (
                    <div className="flex justify-center pt-8">
                      <div className="w-6 h-6 border-2 border-[#046BD2] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <MessageCircle size={28} className="text-[#046BD2] opacity-50" />
                      </div>
                      <p className="text-sm font-medium">Start the conversation!</p>
                      <p className="text-xs text-center">Send a message to inquire about the item.</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const isMine = senderId?.toString() === user?._id?.toString();

                      return (
                        <div key={msg._id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[70%] flex flex-col gap-1">
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? "bg-[#046BD2] text-white rounded-br-sm shadow-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className={`text-[10px] text-gray-400 ${isMine ? "text-right" : "text-left"} px-1`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input — pinned to bottom */}
                <div className="px-4 py-4 bg-white border-t border-gray-100 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="bg-[#046BD2] hover:bg-[#035bb3] text-white p-3 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#F7F9FB] gap-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100">
                  <MessageCircle size={36} className="text-[#046BD2] opacity-60" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the left panel to start chatting.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

