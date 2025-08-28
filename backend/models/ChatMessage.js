import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },   // ✅ use "text" instead of "message"
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);
