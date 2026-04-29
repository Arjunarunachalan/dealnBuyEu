"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useChatStore from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Navbar from "../../components/layout/Navbar";
import {
  MessageCircle, Send, ChevronRight, Package, ArrowLeft,
  Tag, CheckCircle, XCircle, Clock, DollarSign, X
} from "lucide-react";

const getOtherParticipant = (participants, myId) => {
  if (!participants || !myId) return null;
  return participants.find((p) => {
    const pId = p._id?.toString() || p?.toString();
    return pId !== myId?.toString();
  });
};

const SUGGESTIONS = [
  "Is this still available?",
  "Is the price negotiable?",
  "Where can we meet?",
  "Can you share more photos?",
  "Is this item sold?",
  "What is the condition?",
];

const OFFER_STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200", Icon: Clock },
  accepted: { label: "Accepted", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", Icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200",   Icon: XCircle },
};

function OfferBubble({ msg, isMine, onAccept, onReject, isResponding }) {
  const status = msg.offer?.status || "pending";
  const cfg = OFFER_STATUS_CONFIG[status];
  const StatusIcon = cfg.Icon;

  return (
    <div className={`max-w-[72%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
      <div className={`w-full rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-current/10">
          <div className="w-7 h-7 rounded-full bg-[#046BD2]/10 flex items-center justify-center flex-shrink-0">
            <Tag size={14} className="text-[#046BD2]" />
          </div>
          <span className="text-[13px] font-bold text-gray-800">Price Offer</span>
          <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
            <StatusIcon size={11} />
            {cfg.label}
          </div>
        </div>
        {/* Amount */}
        <div className="px-4 py-3">
          <p className="text-2xl font-extrabold text-gray-900">€{Number(msg.offer?.amount).toLocaleString()}</p>
          {msg.offer?.note && (
            <p className="text-xs text-gray-500 mt-1 italic">"{msg.offer.note}"</p>
          )}
        </div>
        {/* Actions for seller only, when pending */}
        {!isMine && status === "pending" && (
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => onAccept(msg._id)}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <CheckCircle size={14} /> Accept
            </button>
            <button
              onClick={() => onReject(msg._id)}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-[13px] font-semibold py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-400 px-1">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

function OfferModal({ postPrice, onClose, onSubmit, isSending }) {
  const [amount, setAmount] = useState(postPrice ? String(Math.round(postPrice * 0.9)) : "");
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onSubmit(Number(amount), note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign size={16} className="text-[#046BD2]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Make an Offer</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        {postPrice && (
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5 mb-4">
            <Tag size={14} className="text-[#046BD2]" />
            <p className="text-sm text-[#046BD2] font-medium">Listed price: <span className="font-bold">€{postPrice.toLocaleString()}</span></p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Your Offer (€)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">€</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I can pick it up today..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
            />
          </div>
          <button
            type="submit"
            disabled={!amount || isNaN(amount) || Number(amount) <= 0 || isSending}
            className="w-full bg-[#046BD2] hover:bg-[#035bb3] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
            ) : (
              <><DollarSign size={16} /> Send Offer</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const {
    conversations, activeConversation, messages, isLoading,
    initSocket, fetchConversations, fetchMessages, setActiveConversation,
    sendMessage, sendOffer, respondToOffer,
  } = useChatStore();

  const [messageText, setMessageText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isSendingOffer, setIsSendingOffer] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [usedSuggestions, setUsedSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/registration_login"); return; }
    if (user?._id) initSocket(user._id);
  }, [user, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user?._id) fetchConversations();
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!activeConversation?._id) return;
    const interval = setInterval(() => {
      fetchMessages(activeConversation._id, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversation?._id]);

  // Reset used suggestions when switching conversations
  useEffect(() => {
    setUsedSuggestions([]);
  }, [activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    const receiver = getOtherParticipant(activeConversation.participants, user?._id);
    if (!receiver) return;
    const receiverId = String(receiver._id || receiver);
    const trimmedText = messageText.trim();
    const optimisticMsg = {
      _id: `temp-${Date.now()}`, conversationId: activeConversation._id,
      sender: user._id, text: trimmedText, messageType: "text",
      createdAt: new Date().toISOString(),
    };
    useChatStore.setState((s) => ({ messages: [...s.messages, optimisticMsg] }));
    sendMessage(trimmedText, receiverId);
    setMessageText("");
  };

  const handleSuggestion = (text) => {
    if (!activeConversation) return;
    const receiver = getOtherParticipant(activeConversation.participants, user?._id);
    if (!receiver) return;
    const receiverId = String(receiver._id || receiver);
    const optimisticMsg = {
      _id: `temp-${Date.now()}`, conversationId: activeConversation._id,
      sender: user._id, text, messageType: "text",
      createdAt: new Date().toISOString(),
    };
    useChatStore.setState((s) => ({ messages: [...s.messages, optimisticMsg] }));
    sendMessage(text, receiverId);
    setUsedSuggestions((prev) => [...prev, text]);
  };

  const handleSendOffer = async (amount, note) => {
    setIsSendingOffer(true);
    await sendOffer(amount, note);
    setIsSendingOffer(false);
    setShowOfferModal(false);
  };

  const handleAccept = async (messageId) => {
    setRespondingId(messageId);
    await respondToOffer(messageId, "accept");
    setRespondingId(null);
  };

  const handleReject = async (messageId) => {
    setRespondingId(messageId);
    await respondToOffer(messageId, "reject");
    setRespondingId(null);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileChatOpen(true);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = Date.now() - date;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const activeSuggestions = SUGGESTIONS.filter((s) => !usedSuggestions.includes(s));
  const isSeller = activeConversation
    ? String(activeConversation.post?.userId || "") === String(user?._id)
    : false;

  if (!isLoggedIn) return null;

  return (
    <>
      <style>{`
        @keyframes slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        @keyframes chip-in { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .chip-animate { animation: chip-in 0.2s ease-out both; }
      `}</style>

      <div className="h-screen flex flex-col overflow-hidden bg-[#F3F4F6]">
        <Navbar />

        <div className="flex-1 flex flex-col overflow-hidden max-w-[1200px] mx-auto w-full px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2 flex-shrink-0">
            <MessageCircle size={22} className="text-[#046BD2]" />
            Messages
          </h1>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden flex-1 min-h-0">

            {/* ── Left Sidebar ── */}
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
                    const lastMsg = conv.lastMessage?.offer
                      ? `💰 Offer: €${conv.lastMessage.offer.amount}`
                      : conv.lastMessage?.text || "No messages yet";

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150 ${
                          isActive ? "bg-blue-50 border-l-4 border-l-[#046BD2]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
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
              {activeConversation ? (() => {
                const other = getOtherParticipant(activeConversation.participants, user?._id);
                const displayName = other?.pseudoName || other?.name || "User";
                const initial = displayName.charAt(0).toUpperCase();
                const postTitle = activeConversation.post?.title || "Item";
                const postPrice = activeConversation.post?.price;

                return (
                  <>
                    {/* Chat Header */}
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

                    {/* Messages Area */}
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
                          <p className="text-xs text-center">Send a message or tap a suggestion below.</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const senderId = msg.sender?._id || msg.sender;
                          const isMine = senderId?.toString() === user?._id?.toString();

                          if (msg.messageType === "offer") {
                            return (
                              <div key={msg._id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <OfferBubble
                                  msg={msg}
                                  isMine={isMine}
                                  onAccept={handleAccept}
                                  onReject={handleReject}
                                  isResponding={respondingId === msg._id}
                                />
                              </div>
                            );
                          }

                          return (
                            <div key={msg._id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div className="max-w-[70%] flex flex-col gap-1">
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isMine
                                    ? "bg-[#046BD2] text-white rounded-br-sm shadow-sm"
                                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                                }`}>
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

                    {/* Quick Reply Suggestions */}
                    {activeSuggestions.length > 0 && (
                      <div className="px-4 pt-3 pb-1 bg-white border-t border-gray-50 flex-shrink-0">
                        <div className="flex flex-wrap gap-2">
                          {activeSuggestions.slice(0, 4).map((s, i) => (
                            <button
                              key={s}
                              onClick={() => handleSuggestion(s)}
                              className="chip-animate text-xs font-medium text-[#046BD2] bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all"
                              style={{ animationDelay: `${i * 50}ms` }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Bar */}
                    <div className="px-4 py-4 bg-white border-t border-gray-100 flex-shrink-0">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        {/* Make Offer button — only for buyers */}
                        {!isSeller && (
                          <button
                            type="button"
                            onClick={() => setShowOfferModal(true)}
                            title="Make an Offer"
                            className="flex-shrink-0 bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 p-2.5 rounded-full transition-all"
                          >
                            <Tag size={17} />
                          </button>
                        )}
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
                );
              })() : (
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

      {/* Offer Modal */}
      {showOfferModal && (
        <OfferModal
          postPrice={activeConversation?.post?.price}
          onClose={() => setShowOfferModal(false)}
          onSubmit={handleSendOffer}
          isSending={isSendingOffer}
        />
      )}
    </>
  );
}
