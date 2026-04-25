import express from "express";
import { searchHandler } from "./search.controller.js";

const searchRoutes = express.Router();

// GET /api/search?q=<query>
searchRoutes.get("/", searchHandler);

export default searchRoutes;
