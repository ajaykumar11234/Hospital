// models/ChatMessage.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  sender: { type: String, enum: ["doctor", "patient"], required: true },
  text: { type: String, required: true }, // 🔐 encrypted "iv:ciphertext"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatMessage", chatMessageSchema);
