import { io } from "socket.io-client";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BASE_URL = "http://localhost:4000";

// Change these for doctor / patient
const USER_TYPE = process.argv[2] || "patient"; // 'doctor' or 'patient'
const APPOINTMENT_ID = process.argv[3] || "123";

const socket = io(BASE_URL);

// Join room
socket.on("connect", () => {
  console.log(`✅ Connected as ${USER_TYPE} (${socket.id})`);
  socket.emit("joinRoom", { appointmentId: APPOINTMENT_ID });
});

// Load chat history
socket.on("history", (history) => {
  console.log("📜 Chat history:");
  history.forEach((msg) => {
    console.log(`[${msg.sender}] ${msg.text}`);
  });
});

// Listen for new messages
socket.on("message", (msg) => {
  console.log(`\n[${msg.sender}] ${msg.text}`);
  rl.prompt();
});

// Read messages from terminal
rl.setPrompt(`${USER_TYPE}> `);
rl.prompt();

rl.on("line", (line) => {
  if (!line.trim()) return rl.prompt();

  socket.emit("chatMessage", {
    appointmentId: APPOINTMENT_ID,
    sender: USER_TYPE,
    text: line.trim(),
  }, (ack) => {
    if (ack?.ok) {
      // console.log("Message sent ✅");
    } else {
      console.error("❌ Failed to send message", ack?.error);
    }
  });

  rl.prompt();
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
