import { create } from "zustand";
import { io } from "socket.io-client";
import axiosInstance from "../lib/axiosInstance";
import { useAuthStore } from "./useAuthStore";

// Socket connects to the same server as the API, just without /api
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

const useChatStore = create((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  // Initialize socket connection
  initSocket: (userId) => {
    const { socket } = get();
    if (socket) return; // Already initialized

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("register", userId);
    });

    newSocket.on("receive_message", (message) => {
      const { activeConversation, messages, conversations } = get();
      
      if (activeConversation && activeConversation._id?.toString() === message.conversationId?.toString()) {
        // Remove any temp optimistic message with same text+sender, then add the real one
        const filtered = messages.filter(
          (m) => !(String(m._id).startsWith("temp-") && m.text === message.text && String(m.sender) === String(message.sender))
        );
        set({ messages: [...filtered, message] });
      }

      const updatedConversations = conversations.map((c) => {
        if (c._id?.toString() === message.conversationId?.toString()) {
          return { ...c, lastMessage: message, updatedAt: message.createdAt };
        }
        return c;
      });
      updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      set({ conversations: updatedConversations });
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
      
      const { socket } = get();
      if (socket) {
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
      
      // Update conversations list if it's a new one
      const { conversations } = get();
      const exists = conversations.find(c => c._id === conversation._id);
      if (!exists) {
        set({ conversations: [conversation, ...conversations] });
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

