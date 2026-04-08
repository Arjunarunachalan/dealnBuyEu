import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import User from "./backend/models/User.js";
import Category from "./backend/modules/category/Category.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "backend/.env") });

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("DB connected for test.");

  // Test 1: API without header -> ❌ should fail
  const resNoHeader = await fetch(`${BASE_URL}/categories`);
  const dataNoHeader = await resNoHeader.json();
  if (resNoHeader.status === 400 && dataNoHeader.success === false) {
    console.log("✅ API without header -> FAILED (as expected). Error:", dataNoHeader.message);
  } else {
    console.error("❌ API without header DID NOT fail as expected!", resNoHeader.status, dataNoHeader);
  }

  // Test 2 & 3: FR / DE isolation in data
  // Let's create a temporary user to get an auth token
  const testUser = await User.create({
    name: "Test",
    surname: "User",
    pseudoName: "testy",
    email: "test.isolation@example.com",
    password: "password123",
    country: "FR",
    isVerified: true
  });
  
  const token = jwt.sign({ id: testUser._id }, process.env.JWT_ACCESS_SECRET || "jwt_access_dealnbuy_eu_2026", { expiresIn: "1h" });

  // Let's find a category in FR to post to
  const frCategories = await fetch(`${BASE_URL}/categories`, { headers: { "x-country-code": "FR" } }).then(r => r.json());
  console.log(`✅ FR Category Data loaded. Fetched root nodes: ${frCategories.data.length}`);
  
  const deCategories = await fetch(`${BASE_URL}/categories`, { headers: { "x-country-code": "DE" } }).then(r => r.json());
  console.log(`✅ DE Category Data loaded. Fetched root nodes: ${deCategories.data.length}`);

  // Test 4: Create post -> saved with correct country
  // We need to fetch a valid child category to post. We look at DB directly for a quick FR leaf category
  const leafCategory = await Category.findOne({ country: "FR", parentId: { $ne: null } });
  
  if (leafCategory) {
    const postBody = {
      title: "FR Test Post",
      description: "This is isolation test",
      price: 150,
      categoryId: leafCategory._id
    };

    const createRes = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "x-country-code": "FR"
      },
      body: JSON.stringify(postBody)
    });

    const createData = await createRes.json();
    if (createRes.status === 201) {
      console.log("✅ Post Created via API with FR header!");
      console.log("-> DB Record for Post:", createData.data.country);

      // Verify cross bleed
      const fetchFrPosts = await fetch(`${BASE_URL}/posts`, { headers: { "x-country-code": "FR" } }).then(r => r.json());
      const fetchDePosts = await fetch(`${BASE_URL}/posts`, { headers: { "x-country-code": "DE" } }).then(r => r.json());
      
      const foundInFr = fetchFrPosts.data.posts.find(p => p._id === createData.data._id);
      const foundInDe = fetchDePosts.data.posts.find(p => p._id === createData.data._id);

      console.log("✅ Post found in FR query:", !!foundInFr);
      console.log("✅ Post hidden in DE query:", !foundInDe);
    } else {
      console.error("❌ Failed to create post:", createData);
    }
  } else {
    console.log("No valid FR leaf category found. Skipping post creation.");
  }

  // Cleanup
  await User.deleteOne({ _id: testUser._id });
  process.exit(0);
}

runTests();
