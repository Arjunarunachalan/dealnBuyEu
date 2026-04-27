// Test with REAL conversation ID — uses the actual IDs from the backend logs
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
// These are REAL conversation IDs from the user's backend logs
const REAL_CONV_ID = "69ef1109f244b6244da97e55";
const USER_A_ID = "69e1f7232314ab11716082ec"; // Logged-in user from backend logs

console.log("━━━━━ Real Conversation Room Test ━━━━━\n");

const sockA = io(SOCKET_URL, { transports: ["websocket", "polling"] });
const sockB = io(SOCKET_URL, { transports: ["websocket", "polling"] });

let aReady = false, bReady = false;

sockA.on("connect", () => {
  console.log(`[A] Connected: ${sockA.id}`);
  sockA.emit("register", USER_A_ID);
  sockA.emit("join_conversation", REAL_CONV_ID);
  console.log(`[A] Joined room ${REAL_CONV_ID}`);
  aReady = true;
  trySend();
});

sockB.on("connect", () => {
  console.log(`[B] Connected: ${sockB.id}`);
  sockB.emit("register", "some-other-user");
  sockB.emit("join_conversation", REAL_CONV_ID);
  console.log(`[B] Joined room ${REAL_CONV_ID}`);
  bReady = true;
  trySend();
});

// Catch ALL events
sockA.onAny((event, ...args) => {
  console.log(`[A] ⚡ EVENT "${event}":`, JSON.stringify(args).substring(0, 200));
});

sockB.onAny((event, ...args) => {
  console.log(`[B] ⚡ EVENT "${event}":`, JSON.stringify(args).substring(0, 200));
});

function trySend() {
  if (!aReady || !bReady) return;
  setTimeout(() => {
    console.log(`\n[B] Sending message via send_message...`);
    sockB.emit("send_message", {
      conversationId: REAL_CONV_ID,
      senderId: USER_A_ID,      // Use real user ID so Mongoose doesn't reject it
      receiverId: USER_A_ID,    // Send to self for testing
      text: "SOCKET_TEST_" + Date.now(),
    });
  }, 800);
}

setTimeout(() => {
  console.log("\n━━━━━ Done ━━━━━");
  sockA.disconnect();
  sockB.disconnect();
  process.exit(0);
}, 6000);
