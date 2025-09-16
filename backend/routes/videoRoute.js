import express from "express";

const router = express.Router();

// Generate video call room (use appointmentId)
router.get("/:appointmentId", (req, res) => {
  const { appointmentId } = req.params;
  if (!appointmentId) {
    return res.status(400).json({ error: "Missing appointmentId" });
  }

  // For now, just return a room link using Jitsi public server
  const roomName = `health-${appointmentId}`;
  const url = `https://meet.jit.si/${roomName}`;

  res.json({ roomUrl: url });
});

export default router;
