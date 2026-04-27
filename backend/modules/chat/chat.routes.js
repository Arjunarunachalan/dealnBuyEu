import express from "express";
import { getConversations, getMessages, startConversation } from "./chat.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.route("/conversations").get(protect, getConversations);
router.route("/start").post(protect, startConversation);
router.route("/:id/messages").get(protect, getMessages);

export default router;
