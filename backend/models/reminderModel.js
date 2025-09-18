import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicineName: { type: String, required: true },
  times: [{ type: String, required: true }], // array of strings
  toEmail: { type: String, required: true },
  durationDays: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now } // <-- Added createdAt
});

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
