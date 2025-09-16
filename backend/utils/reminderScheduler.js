import cron from "node-cron";
import Reminder from "../models/reminderModel.js";
import nodemailer from "nodemailer";

export const startReminderScheduler = () => {
  console.log("⏰ Starting reminder scheduler...");

  // Email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password if using Gmail
    },
  });

  const checkReminders = async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute
        .toString()
        .padStart(2, "0")}`;

      const reminders = await Reminder.find({});
      console.log(`🔎 Checking ${reminders.length} reminders at ${currentTimeStr}`);

      for (const reminder of reminders) {
        // Calculate if reminder is still active
        const createdAt = new Date(reminder.createdAt);
        const endDate = new Date(createdAt);
        endDate.setDate(endDate.getDate() + Number(reminder.durationDays));

        if (now > endDate) {
          console.log(`🛑 Removing expired reminder: ${reminder.medicineName}`);
          await Reminder.findByIdAndDelete(reminder._id);
          continue;
        }

        // Send email if current time matches any reminder time
        for (const time of reminder.times) {
          if (time === currentTimeStr) {
            console.log(`✅ Reminder triggered for ${reminder.medicineName} to ${reminder.toEmail}`);

            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: reminder.toEmail,
              subject: `Medicine Reminder: ${reminder.medicineName}`,
              text: `It's time to take your medicine: ${reminder.medicineName}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("❌ Error sending email:", err);
              } else {
                console.log(`📧 Email sent: ${info.response}`);
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ Error in reminder scheduler:", err);
    }
  };

  // Run every minute
  cron.schedule("* * * * *", checkReminders);
  console.log("✅ Reminder scheduler running every minute.");
};
