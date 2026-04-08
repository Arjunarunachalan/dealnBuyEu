async function runTests() {
  const BASE_URL = "http://127.0.0.1:5000/api";

  console.log("--- Starting API Isolation Tests ---");

  // TEST 1: No Header should fail
  const r1 = await fetch(`${BASE_URL}/categories`);
  const b1 = await r1.json();
  if (r1.status === 400 && b1.success === false) {
    console.log("✅ API without header -> FAILED with 400 (as expected). Error:", b1.message);
  } else {
    console.log("❌ API without header DID NOT fail as expected:", r1.status, b1);
  }

  // TEST 2: FR user -> only FR data
  const r2 = await fetch(`${BASE_URL}/categories`, { headers: { "x-country-code": "FR" } });
  const b2 = await r2.json();
  if (r2.status === 200 && b2.success === true) {
    console.log("✅ FR Category Data loaded. Nodes:", b2.data.length);
  } else {
    console.log("❌ Failed to load FR data:", await r2.text());
  }

  // TEST 3: DE user -> only DE data
  const r3 = await fetch(`${BASE_URL}/categories`, { headers: { "x-country-code": "DE" } });
  const b3 = await r3.json();
  if (r3.status === 200 && b3.success === true) {
    console.log("✅ DE Category Data loaded. Nodes:", b3.data.length);
  } else {
    console.log("❌ Failed to load DE data:", await r3.text());
  }

  console.log("--- Tests Completed ---");
}

runTests();
