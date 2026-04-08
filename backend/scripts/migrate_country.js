import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "../models/User.js";
import Post from "../modules/post/Post.model.js";
import Category from "../modules/category/Category.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const MARKETS = ["FR", "DE", "UK", "IT"]; // Target markets to duplicate categories into

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Migration...\n");

    try {
      console.log("Attempting to drop legacy 'slug_1' index from  categories...");
      await Category.collection.dropIndex("slug_1");
      console.log("Dropped legacy 'slug_1' index.");
    } catch (e) {
      console.log("Index 'slug_1' might not exist or error:", e.message);
    }

    // ─────────────────────────────────────────────────────────
    // 1. MIGRATE POSTS
    // ─────────────────────────────────────────────────────────
    console.log("Starting Posts Migration...");
    const postsWithoutCountry = await Post.find({
      $or: [{ country: { $exists: false } }, { country: null }, { country: "" }],
    });

    console.log(`Found ${postsWithoutCountry.length} posts missing a country.`);

    for (const post of postsWithoutCountry) {
      if (post.userId) {
        const user = await User.findById(post.userId).select("country").lean();
        if (user && user.country) {
          post.country = user.country.toUpperCase();
          await post.save();
          process.stdout.write(`+`);
        } else {
          // If no user country is found, we must delete it to prevent orphan violations
          console.warn(`\nWarning: Post ${post._id} has a User without country! Deleting to enforce strict structure.`);
          await Post.deleteOne({ _id: post._id });
        }
      } else {
        console.warn(`\nWarning: Post ${post._id} has NO User! Deleting.`);
        await Post.deleteOne({ _id: post._id });
      }
    }
    console.log("\nPosts Migration Complete.\n");

    // ─────────────────────────────────────────────────────────
    // 2. MIGRATE CATEGORIES
    // ─────────────────────────────────────────────────────────
    console.log("Starting Category Migration...");
    const legacyCategories = await Category.find({
      $or: [{ country: { $exists: false } }, { country: null }, { country: "" }],
    }).lean();

    console.log(`Found ${legacyCategories.length} legacy categories mapping across ${MARKETS.length} new markets.`);

    // To properly map parentIds, we must map Old ID -> New ID per market
    const idMap = {}; // { "FR": { oldId1: newId1, oldId2: newId2 } }
    MARKETS.forEach((m) => (idMap[m] = {}));

    // First Pass: Create all categories across all markets
    for (const cat of legacyCategories) {
      for (const market of MARKETS) {
        const newCat = new Category({
          ...cat,
          _id: new mongoose.Types.ObjectId(), // fresh ID
          country: market,
        });
        await newCat.save();
        idMap[market][cat._id.toString()] = newCat._id.toString();
      }
      process.stdout.write(`.`);
    }

    // Second Pass: Update Parent IDs for the newly duplicated categories
    console.log("\nRe-linking hierarchical Parent IDs...");
    for (const market of MARKETS) {
      for (const oldId of Object.keys(idMap[market])) {
        const newId = idMap[market][oldId];
        const newCat = await Category.findById(newId);

        if (newCat.parentId && idMap[market][newCat.parentId.toString()]) {
          newCat.parentId = idMap[market][newCat.parentId.toString()];
          await newCat.save();
        }
      }
    }

    // Third Pass: Delete all the original legacy categories
    console.log("\nCleaning up legacy structural nodes...");
    const legacyIds = legacyCategories.map((c) => c._id);
    await Category.deleteMany({ _id: { $in: legacyIds } });

    console.log("Category Migration Complete.\n");
    console.log("--- MIGRATION FINISHED SUCCESSFULLY ---");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

runMigration();
