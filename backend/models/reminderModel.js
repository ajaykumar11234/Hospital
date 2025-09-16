import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicineName: { type: String, required: true },
  times: [{ type: String, required: true }], // now it's an array of strings
  toEmail: { type: String, required: true },
  durationDays: { type: Number, required: true },
});

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
