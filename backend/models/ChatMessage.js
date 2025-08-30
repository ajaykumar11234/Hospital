import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true },
  sender: { type: String, required: true }, // 'doctor' or 'patient'
  text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);
