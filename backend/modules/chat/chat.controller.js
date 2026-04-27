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
