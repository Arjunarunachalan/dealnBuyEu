import { Server } from "socket.io";
import { Message, Conversation } from "./modules/chat/chat.model.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        callback(null, true);
      },
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });

  // Keep track of connected users: userId (string) → socketId
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`[WS] connected: ${socket.id}`);

    // ── Register user ──
    socket.on("register", (userId) => {
      const uid = String(userId);
      connectedUsers.set(uid, socket.id);
      console.log(`[WS] registered user ${uid} → ${socket.id}`);
    });

    // ── Join a conversation room ──
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`[WS] ${socket.id} joined room ${conversationId}`);
    });

    // ── Handle sending message ──
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, text } = data;
        const receiverId = String(data.receiverId);

        // 1. Persist
        const newMessage = await Message.create({
          conversationId,
          sender: senderId,
          text,
          messageType: "text",
          readBy: [senderId],
        });

        // 2. Update conversation's lastMessage pointer
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        // 3. Build a plain object to emit (avoid Mongoose doc quirks)
        const payload = newMessage.toObject();

        // 4. Broadcast to the conversation room (every socket in the room)
        io.to(conversationId).emit("receive_message", payload);
        console.log(`[WS] emitted receive_message to room ${conversationId}`);

        // 5. Also send a direct notification to the receiver's socket
        //    (catches the case where they haven't joined the room yet)
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message_notification", payload);
          console.log(`[WS] emitted new_message_notification → ${receiverSocketId}`);
        } else {
          console.log(`[WS] receiver ${receiverId} not connected`);
        }
      } catch (error) {
        console.error("[WS] Error in send_message:", error);
      }
    });

    // ── Handle offer response via socket (real-time update) ──
    // Called AFTER the REST PATCH succeeds on the client side
    socket.on("offer_respond", async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Fetch fresh from DB so we have the latest status
        const updatedMessage = await Message.findById(messageId);
        if (!updatedMessage) return;

        const payload = updatedMessage.toObject();

        // Broadcast updated offer to the whole conversation room
        io.to(conversationId).emit("offer_updated", payload);
        console.log(`[WS] emitted offer_updated to room ${conversationId}`);

        // Also notify the offer sender directly if not in the room
        const senderSocketId = connectedUsers.get(String(updatedMessage.sender));
        if (senderSocketId) {
          io.to(senderSocketId).emit("offer_updated", payload);
        }
      } catch (error) {
        console.error("[WS] Error in offer_respond:", error);
      }
    });

    // ── Handle disconnect ──
    socket.on("disconnect", () => {
      console.log(`[WS] disconnected: ${socket.id}`);
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
