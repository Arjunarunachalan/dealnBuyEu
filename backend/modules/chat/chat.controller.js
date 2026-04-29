import { Conversation, Message } from "./chat.model.js";
import { decryptField } from "../../utils/fieldEncryption.js";

// Helper: decrypt sensitive fields on a populated user object
const decryptParticipant = (participant) => {
  if (!participant || !participant._id) return participant;
  return {
    _id: participant._id,
    name: decryptField(participant.name),
    surname: decryptField(participant.surname),
    pseudoName: decryptField(participant.pseudoName),
    email: decryptField(participant.email),
  };
};

// Helper: decrypt all participants in a conversation doc
const decryptConversation = (conv) => {
  const obj = conv.toObject ? conv.toObject() : { ...conv };
  obj.participants = (obj.participants || []).map(decryptParticipant);
  return obj;
};


// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "name surname pseudoName email")
      .populate("post", "title images price")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const decrypted = conversations.map(decryptConversation);
    res.status(200).json(decrypted);
  } catch (error) {
    console.error("Error in getConversations:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Use string comparison to avoid ObjectId type mismatch
    const participantIds = conversation.participants.map((p) => p.toString());
    if (!participantIds.includes(userId.toString())) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Start or get existing conversation for a post
// @route   POST /api/chat/start
// @access  Private
export const startConversation = async (req, res) => {
  try {
    const { postId, sellerId } = req.body;
    const buyerId = req.user._id;

    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [buyerId, sellerId] },
      post: postId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [buyerId, sellerId],
        post: postId,
      });
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name surname pseudoName email")
      .populate("post", "title images price");

    res.status(200).json(decryptConversation(populatedConversation));
  } catch (error) {
    console.error("Error in startConversation:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Buyer submits a price offer in a conversation
// @route   POST /api/chat/:conversationId/offer
// @access  Private (buyer only)
export const sendOffer = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { amount, note } = req.body;
    const buyerId = req.user._id;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Please provide a valid offer amount." });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify requester is a participant
    const participantIds = conversation.participants.map((p) => p.toString());
    if (!participantIds.includes(buyerId.toString())) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const offerMessage = await Message.create({
      conversationId,
      sender: buyerId,
      messageType: "offer",
      text: note || "",
      offer: {
        amount: Number(amount),
        note: note || "",
        status: "pending",
      },
      readBy: [buyerId],
    });

    // Update conversation's lastMessage pointer
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: offerMessage._id,
    });

    res.status(201).json(offerMessage.toObject());
  } catch (error) {
    console.error("Error in sendOffer:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Seller accepts or rejects a price offer
// @route   PATCH /api/chat/offer/:messageId/respond
// @access  Private (seller only)
export const respondToOffer = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action } = req.body; // 'accept' | 'reject'
    const userId = req.user._id;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'accept' or 'reject'." });
    }

    const message = await Message.findById(messageId);
    if (!message || message.messageType !== "offer") {
      return res.status(404).json({ message: "Offer message not found" });
    }

    if (message.offer.status !== "pending") {
      return res.status(400).json({ message: "This offer has already been responded to." });
    }

    // Only the OTHER participant (non-sender = seller) can respond
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isSender = message.sender.toString() === userId.toString();
    if (isSender) {
      return res.status(403).json({ message: "You cannot respond to your own offer." });
    }

    const isParticipant = conversation.participants
      .map((p) => p.toString())
      .includes(userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.offer.status = action === "accept" ? "accepted" : "rejected";
    await message.save();

    res.status(200).json(message.toObject());
  } catch (error) {
    console.error("Error in respondToOffer:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
