import express from "express";
import ChatMessage from "../models/ChatMessage.js";

const router = express.Router();

// GET chat history for a given appointment
router.get("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const messages = await ChatMessage.find({ appointmentId })
      .sort({ createdAt: 1 }); // oldest -> newest

    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export default router;
