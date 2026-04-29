import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 'text' for normal messages, 'offer' for price offers
    messageType: {
      type: String,
      enum: ["text", "offer"],
      default: "text",
    },
    text: {
      type: String,
      trim: true,
      // Optional for offer messages (may carry a note)
    },
    // Only populated when messageType === 'offer'
    offer: {
      amount: { type: Number },
      note: { type: String, trim: true },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
export const Conversation = mongoose.model("Conversation", conversationSchema);
