import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import { categoryPublicRouter, categoryAdminRouter } from "./modules/category/category.routes.js";
import postRoutes from "./modules/post/post.routes.js";
import passport from "passport";
import "./config/passport.js";
import { countryGateway } from "./middleware/countryGateway.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Apply Gateway to ALL routes to strictly enforce country architecture
app.use("/api", countryGateway);

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/categories", categoryAdminRouter);
app.use("/api/categories", categoryPublicRouter);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});