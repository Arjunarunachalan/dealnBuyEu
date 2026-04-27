import { Server } from "socket.io";
import { Message, Conversation } from "./modules/chat/chat.model.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow all origins in development (reflects the origin back)
        callback(null, true);
      },
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
      console.log(`[Socket] received send_message:`, data);
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
        console.log(`[Socket] Message saved to DB: ${newMessage._id}`);

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        // Emit message to the conversation room
        console.log(`[Socket] Emitting receive_message to room: ${conversationId}`);
        io.to(conversationId).emit("receive_message", newMessage);

        // If receiver is connected but not in the room, we can emit a notification to them directly
        const receiverSocketId = connectedUsers.get(receiverId);
        console.log(`[Socket] Receiver ${receiverId} socket ID: ${receiverSocketId || "NOT CONNECTED"}`);
        
        if (receiverSocketId) {
          console.log(`[Socket] Emitting new_message_notification to socket: ${receiverSocketId}`);
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
