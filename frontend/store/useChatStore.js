import { create } from "zustand";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axiosInstance";
import { useAuthStore } from "./useAuthStore";

// Socket connects to the same server as the API, just without /api
const SOCKET_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api$/, "");

// ── Module-level singleton ──────────────────────────────────────────────────
// Keep the socket OUTSIDE of Zustand so React re-renders can never reset it.
let _socket = null;
let _userId = null;

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  // ── Initialize socket (idempotent — safe to call many times) ────────────
  initSocket: (userId) => {
    // If already initialised with the same user, skip
    if (_socket && _userId === userId) return;

    // Tear down any old socket first
    if (_socket) {
      _socket.removeAllListeners();
      _socket.disconnect();
    }

    _userId = userId;

    const sock = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // ── On every (re)connect, register + join rooms ─────────────────────
    sock.on("connect", () => {
      console.log("[WS] connected:", sock.id);
      sock.emit("register", userId);

      // Re-join every conversation room (rooms are cleared on reconnect)
      const { conversations } = get();
      conversations.forEach((c) => sock.emit("join_conversation", c._id));
    });

    // ── Incoming text message via ROOM broadcast ──────────────────────────
    sock.on("receive_message", (msg) => {
      console.log("[WS] receive_message:", msg.text);
      _handleMsg(msg, set);
    });

    // ── Incoming message via DIRECT notification ─────────────────────────
    sock.on("new_message_notification", (msg) => {
      console.log("[WS] new_message_notification:", msg.text);
      _handleMsg(msg, set);
    });

    // ── Offer status updated (accept/reject) ─────────────────────────────
    sock.on("offer_updated", (updatedMsg) => {
      console.log("[WS] offer_updated:", updatedMsg._id, updatedMsg.offer?.status);
      set((state) => {
        const newMessages = state.messages.map((m) =>
          String(m._id) === String(updatedMsg._id) ? updatedMsg : m
        );
        return { messages: newMessages };
      });
    });

    sock.on("disconnect", (reason) => {
      console.log("[WS] disconnected:", reason);
    });

    _socket = sock;
  },

  // ── Disconnect socket (called on logout, NOT on component unmount) ─────
  disconnectSocket: () => {
    if (_socket) {
      _socket.removeAllListeners();
      _socket.disconnect();
      _socket = null;
      _userId = null;
    }
  },

  // ── Fetch all conversations ────────────────────────────────────────────
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/chat/conversations");
      set({ conversations: res.data, isLoading: false });

      // Join every room (the socket may already be connected)
      if (_socket) {
        res.data.forEach((c) => _socket.emit("join_conversation", c._id));
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({
        error:
          error.response?.data?.message || "Failed to load conversations",
        isLoading: false,
      });
    }
  },

  // ── Fetch messages for a conversation ──────────────────────────────────
  // `silent` = true skips the loading spinner (used by background polling)
  fetchMessages: async (conversationId, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/chat/${conversationId}/messages`);
      set({ messages: res.data, isLoading: false });

      if (_socket) _socket.emit("join_conversation", conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (!silent) {
        set({
          error: error.response?.data?.message || "Failed to load messages",
          isLoading: false,
        });
      }
    }
  },

  // ── Set active conversation ────────────────────────────────────────────
  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
    if (conversation) {
      get().fetchMessages(conversation._id);
    } else {
      set({ messages: [] });
    }
  },

  // ── Start or get a conversation ────────────────────────────────────────
  startConversation: async (postId, sellerId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/chat/start", {
        postId,
        sellerId,
      });
      const conversation = res.data;

      const { conversations } = get();
      const exists = conversations.find((c) => c._id === conversation._id);
      if (!exists) {
        set({ conversations: [conversation, ...conversations] });
      }

      if (_socket) _socket.emit("join_conversation", conversation._id);

      set({ activeConversation: conversation, isLoading: false });
      get().fetchMessages(conversation._id);

      return conversation;
    } catch (error) {
      console.error("Error starting conversation:", error);
      set({
        error:
          error.response?.data?.message || "Failed to start conversation",
        isLoading: false,
      });
      return null;
    }
  },

  // ── Send text message ───────────────────────────────────────────────────
  sendMessage: (text, receiverId) => {
    const { activeConversation } = get();
    const userId = useAuthStore.getState().user?._id;

    if (!_socket || !activeConversation || !userId) {
      console.warn("[WS] sendMessage blocked — socket/conv/user missing");
      return;
    }

    _socket.emit("send_message", {
      conversationId: activeConversation._id,
      senderId: userId,
      receiverId,
      text,
    });
  },

  // ── Send a price offer (REST, then let socket broadcast handle UI) ─────
  sendOffer: async (amount, note = "") => {
    const { activeConversation } = get();
    if (!activeConversation) return null;

    try {
      const res = await axiosInstance.post(
        `/chat/${activeConversation._id}/offer`,
        { amount, note }
      );
      const offerMsg = res.data;

      // Optimistically append to messages
      set((state) => ({ messages: [...state.messages, offerMsg] }));

      // Let the socket room know too (for the other participant)
      if (_socket) {
        _socket.emit("receive_message", offerMsg); // piggyback on existing room event
      }

      return offerMsg;
    } catch (error) {
      console.error("Error sending offer:", error);
      set({ error: error.response?.data?.message || "Failed to send offer" });
      return null;
    }
  },

  // ── Seller responds to an offer ────────────────────────────────────────
  respondToOffer: async (messageId, action) => {
    const { activeConversation } = get();
    try {
      const res = await axiosInstance.patch(
        `/chat/offer/${messageId}/respond`,
        { action }
      );
      const updatedMsg = res.data;

      // Update the message in local state immediately
      set((state) => ({
        messages: state.messages.map((m) =>
          String(m._id) === String(messageId) ? updatedMsg : m
        ),
      }));

      // Trigger socket event so the other participant's UI also updates
      if (_socket && activeConversation) {
        _socket.emit("offer_respond", {
          messageId,
          conversationId: activeConversation._id,
        });
      }

      return updatedMsg;
    } catch (error) {
      console.error("Error responding to offer:", error);
      set({ error: error.response?.data?.message || "Failed to respond to offer" });
      return null;
    }
  },
}));

// ── Pure helper — processes an incoming message ──────────────────────────────
// Uses Zustand's functional `set` so the state snapshot is always fresh.
function _handleMsg(message, set) {
  console.log("[WS] _handleMsg called with:", message.text, "convId:", message.conversationId);
  
  set((state) => {
    const { activeConversation, messages, conversations } = state;
    
    let newMessages = messages;

    // Only append if the message belongs to the currently-open conversation
    if (
      activeConversation &&
      String(activeConversation._id) === String(message.conversationId)
    ) {
      const isDuplicate = messages.some((m) => m._id === message._id);
      const isOptimistic = messages.some(
        (m) =>
          String(m._id).startsWith("temp-") &&
          m.text === message.text &&
          String(m.sender) === String(message.sender)
      );

      if (isDuplicate) {
        newMessages = messages;
      } else if (isOptimistic) {
        newMessages = [
          ...messages.filter(
            (m) =>
              !(
                String(m._id).startsWith("temp-") &&
                m.text === message.text &&
                String(m.sender) === String(message.sender)
              )
          ),
          message,
        ];
      } else {
        newMessages = [...messages, message];
      }
    }

    // Update conversation sidebar (last message + sort)
    const updatedConversations = conversations.map((c) =>
      String(c._id) === String(message.conversationId)
        ? { ...c, lastMessage: message, updatedAt: message.createdAt }
        : c
    );
    updatedConversations.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    return { messages: newMessages, conversations: updatedConversations };
  });
}

export default useChatStore;
