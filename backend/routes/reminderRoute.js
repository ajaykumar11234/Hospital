import express from "express";
import Reminder from "../models/reminderModel.js";
import { authUser } from "../middlewares/authUser.js";
// this is your middleware

const router = express.Router();

// Add reminder
router.post("/add", authUser, async (req, res) => {
  try {
    const { medicineName, times, toEmail, durationDays } = req.body;

    if (!medicineName || !times || times.length === 0 || !toEmail || !durationDays) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReminder = new Reminder({
      userId: req.user.id,   // ✅ Now works
      medicineName,
      times,
      toEmail,
      durationDays,
    });

    await newReminder.save();
    res.json({ message: "Reminder added successfully" });
  } catch (err) {
    console.error("❌ Error adding reminder:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// List reminders
router.get("/list", authUser, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id });
    res.json(reminders);
  } catch (err) {
    console.error("❌ Error fetching reminders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete reminder
router.delete("/delete/:id", authUser, async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting reminder:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
