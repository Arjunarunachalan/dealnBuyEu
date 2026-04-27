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

    // ── Incoming message via ROOM broadcast ──────────────────────────────
    sock.on("receive_message", (msg) => {
      console.log("[WS] receive_message:", msg.text);
      _handleMsg(msg, set);
    });

    // ── Incoming message via DIRECT notification ─────────────────────────
    sock.on("new_message_notification", (msg) => {
      console.log("[WS] new_message_notification:", msg.text);
      _handleMsg(msg, set);
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
  fetchMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/chat/${conversationId}/messages`);
      set({ messages: res.data, isLoading: false });

      if (_socket) _socket.emit("join_conversation", conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({
        error: error.response?.data?.message || "Failed to load messages",
        isLoading: false,
      });
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

  // ── Send message ───────────────────────────────────────────────────────
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
}));

// ── Pure helper — processes an incoming message ──────────────────────────────
// Uses Zustand's functional `set` so the state snapshot is always fresh.
function _handleMsg(message, set) {
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
        // Already have the real message — do nothing
        newMessages = messages;
      } else if (isOptimistic) {
        // Replace the temp placeholder with the real DB message
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
        // Brand-new message from the other person
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
