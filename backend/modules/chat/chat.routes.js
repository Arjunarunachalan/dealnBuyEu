import express from "express";
import {
  getConversations,
  getMessages,
  startConversation,
  sendOffer,
  respondToOffer,
} from "./chat.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.route("/conversations").get(protect, getConversations);
router.route("/start").post(protect, startConversation);
router.route("/:id/messages").get(protect, getMessages);
router.route("/:conversationId/offer").post(protect, sendOffer);
router.route("/offer/:messageId/respond").patch(protect, respondToOffer);

export default router;
