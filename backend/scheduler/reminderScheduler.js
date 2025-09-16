import cron from "node-cron";
import Reminder from "../models/reminderModel.js";
import nodemailer from "nodemailer";

// Configure your transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your email
    pass: process.env.EMAIL_PASS,   // your app password
  },
});

// Cron job: runs every minute to check reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

  try {
    const reminders = await Reminder.find();

    reminders.forEach((reminder) => {
      reminder.times.forEach((time) => {
        if (time === currentTime) {
          sendReminder(reminder);
        }
      });
    });
  } catch (err) {
    console.error("❌ Error checking reminders:", err.message);
  }
});

// Function to send email reminder
async function sendReminder(reminder) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: reminder.toEmail,
      subject: "💊 Medicine Reminder",
      text: `Don't forget to take your medicine: ${reminder.medicineName}`,
    });
    console.log(`✅ Reminder sent to ${reminder.toEmail} for ${reminder.medicineName}`);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
  }
}

