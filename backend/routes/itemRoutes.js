import express from "express";
import { getItems, createItem } from "../controllers/itemController.js";

const router = express.Router();

router.route("/").get(getItems).post(createItem);

export default router;
