import { create } from "zustand";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axiosInstance";
import { useAuthStore } from "./useAuthStore";

// Socket connects to the same server as the API, just without /api
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

// Helper: process an incoming message (used by both receive_message and new_message_notification)
const handleIncomingMessage = (message, get, set) => {
  const { activeConversation, messages, conversations } = get();

  // If message belongs to the active conversation, add it to the message list
  if (activeConversation && String(activeConversation._id) === String(message.conversationId)) {
    // Deduplicate: skip if we already have this exact DB message or a temp optimistic copy
    const alreadyExists = messages.some(
      (m) => (m._id === message._id) || // same DB _id (already received via room)
        (String(m._id).startsWith("temp-") && m.text === message.text && String(m.sender) === String(message.sender))
    );

    if (alreadyExists) {
      // Replace temp message with real DB message
      const filtered = messages.filter(
        (m) => !(String(m._id).startsWith("temp-") && m.text === message.text && String(m.sender) === String(message.sender))
      );
      // Only add if not already present as a real message
      if (!filtered.some((m) => m._id === message._id)) {
        set({ messages: [...filtered, message] });
      }
    } else {
      set({ messages: [...messages, message] });
    }
  }

  // Update conversation sidebar: last message + sort to top
  const updatedConversations = conversations.map((c) => {
    if (String(c._id) === String(message.conversationId)) {
      return { ...c, lastMessage: message, updatedAt: message.createdAt };
    }
    return c;
  });
  updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  set({ conversations: updatedConversations });
};

const useChatStore = create((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  // Initialize socket connection — called ONCE per session
  initSocket: (userId) => {
    const { socket } = get();
    if (socket) return; // Already exists, don't create another

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("register", userId);

      // Auto-join all conversation rooms so we receive live messages
      const { conversations } = get();
      conversations.forEach((conv) => {
        newSocket.emit("join_conversation", conv._id);
      });
    });

    // Message received via ROOM broadcast (sender + receiver in same room)
    newSocket.on("receive_message", (message) => {
      handleIncomingMessage(message, get, set);
    });

    // Message received via DIRECT notification (fallback when not in room)
    newSocket.on("new_message_notification", (message) => {
      handleIncomingMessage(message, get, set);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected, will auto-reconnect...");
    });

    set({ socket: newSocket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Fetch all conversations for the user
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/chat/conversations");
      set({ conversations: res.data, isLoading: false });

      // Join all conversation rooms so we get live messages
      const { socket } = get();
      if (socket?.connected) {
        res.data.forEach((conv) => {
          socket.emit("join_conversation", conv._id);
        });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ error: error.response?.data?.message || "Failed to load conversations", isLoading: false });
    }
  },

  // Fetch messages for a specific conversation
  fetchMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(`/chat/${conversationId}/messages`);
      set({ messages: res.data, isLoading: false });

      // Ensure we've joined this conversation room
      const { socket } = get();
      if (socket?.connected) {
        socket.emit("join_conversation", conversationId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ error: error.response?.data?.message || "Failed to load messages", isLoading: false });
    }
  },

  // Set active conversation
  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation });
    if (conversation) {
      get().fetchMessages(conversation._id);
    } else {
      set({ messages: [] });
    }
  },

  // Start or get conversation for a post
  startConversation: async (postId, sellerId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/chat/start", { postId, sellerId });
      const conversation = res.data;

      const { conversations, socket } = get();
      const exists = conversations.find((c) => c._id === conversation._id);
      if (!exists) {
        set({ conversations: [conversation, ...conversations] });
      }

      // Join this new conversation room
      if (socket?.connected) {
        socket.emit("join_conversation", conversation._id);
      }

      set({ activeConversation: conversation, isLoading: false });
      get().fetchMessages(conversation._id);

      return conversation;
    } catch (error) {
      console.error("Error starting conversation:", error);
      set({ error: error.response?.data?.message || "Failed to start conversation", isLoading: false });
      return null;
    }
  },

  // Send message
  sendMessage: (text, receiverId) => {
    const { socket, activeConversation } = get();
    const userId = useAuthStore.getState().user?._id;

    if (!socket || !activeConversation || !userId) return;

    socket.emit("send_message", {
      conversationId: activeConversation._id,
      senderId: userId,
      receiverId,
      text,
    });
  },
}));

export default useChatStore;
