import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

const toClientDTO = (doc) => ({
  _id: doc._id,
  appointmentId: doc.appointmentId,
  sender: doc.sender,
  text: doc.text,
  createdAt: doc.createdAt,
});

// GET history
router.get("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const messages = await ChatMessage.find({ appointmentId }).sort({ createdAt: 1 });
    res.json(messages.map(toClientDTO));
  } catch (err) {
    console.error("❌ Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// ✅ POST route
router.post("/send", async (req, res) => {
  try {
    const { appointmentId, sender, text } = req.body;

    if (!appointmentId || !sender || !text?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const saved = await ChatMessage.create({
      appointmentId,
      sender,
      text: text.trim(),
    });

    res.status(201).json(toClientDTO(saved));
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

export default router;
