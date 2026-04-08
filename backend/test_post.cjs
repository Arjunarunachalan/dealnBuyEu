const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function testPostCreation() {
  console.log("--- Starting Post Creation Isolation Test ---");
  await mongoose.connect("mongodb+srv://arjunarunachalan_db_user:cTyGuyh2n579qRCQ@cluster-europe-globale.ck0euko.mongodb.net/?appName=Cluster-Europe-Globale");
  console.log("DB connected.");

  // Inject user directly into DB to get id
  const User = mongoose.model('User', new mongoose.Schema({ country: String }, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({ country: String, parentId: mongoose.Schema.Types.ObjectId }, { strict: false }));
  
  const testUserId = new mongoose.Types.ObjectId();
  await User.collection.insertOne({ _id: testUserId, name: "TestFR", country: "FR", isVerified: true, isActive: true });

  const token = jwt.sign({ id: testUserId.toString() }, "jwt_access_dealnbuy_eu_2026", { expiresIn: "1h" });
  
  const BASE_URL = "http://127.0.0.1:5000/api";
  
  // Get an active FR Category
  const leafCategory = await Category.findOne({ country: "FR", parentId: { $ne: null }, attributes: { $size: 0 } });
  
  if (!leafCategory) {
    console.error("❌ No FR category found to post in.");
    process.exit(1);
  }

  const postBody = {
    title: "FR Server Architecture Testing Post",
    description: "Strict isolation check",
    price: 100,
    categoryId: leafCategory._id.toString()
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
    console.log("-> DB Record for Post Country:", createData.data.country);

    // Verify cross bleed
    const fetchFrPosts = await fetch(`${BASE_URL}/posts`, { headers: { "x-country-code": "FR" } }).then(r => r.json());
    const fetchDePosts = await fetch(`${BASE_URL}/posts`, { headers: { "x-country-code": "DE" } }).then(r => r.json());
    
    const foundInFr = fetchFrPosts.data.posts.find(p => p._id === createData.data._id);
    const foundInDe = fetchDePosts.data.posts.find(p => p._id === createData.data._id);

    console.log("✅ Post specifically returned in FR query?", !!foundInFr);
    console.log("✅ Post strictly blocked in DE query?", !foundInDe);
  } else {
    console.error("❌ Failed to create post:", createData);
  }

  await User.collection.deleteOne({ _id: testUserId });
  process.exit(0);
}

testPostCreation();
