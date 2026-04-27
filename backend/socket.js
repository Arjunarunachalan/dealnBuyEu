import { Server } from "socket.io";
import { Message, Conversation } from "./modules/chat/chat.model.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Keep track of connected users { userId: socketId }
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user
    socket.on("register", (userId) => {
      const uid = String(userId);
      connectedUsers.set(uid, socket.id);
      console.log(`User ${uid} registered with socket ${socket.id}`);
    });

    // Join a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle sending message
    socket.on("send_message", async (data) => {
      try {
        let { conversationId, senderId, text, receiverId } = data;
        receiverId = String(receiverId);

        // Save message to DB
        const newMessage = await Message.create({
          conversationId,
          sender: senderId,
          text,
          readBy: [senderId],
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        // Emit message to the conversation room
        io.to(conversationId).emit("receive_message", newMessage);

        // If receiver is connected but not in the room, we can emit a notification to them directly
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          // You could emit a generic notification event here
          io.to(receiverSocketId).emit("new_message_notification", newMessage);
        }
      } catch (error) {
        console.error("Error saving/sending message via socket:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove user from map
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
