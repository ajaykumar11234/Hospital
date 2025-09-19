// utils/reminderScheduler.js
import Reminder from "../models/reminderModel.js";
import nodemailer from "nodemailer";

export const checkReminders = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute
      .toString()
      .padStart(2, "0")}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password if using Gmail
      },
    });

    const reminders = await Reminder.find({});
    console.log(`🔎 Checking ${reminders.length} reminders at ${currentTimeStr}`);

    for (const reminder of reminders) {
      // Check expiry
      const createdAt = new Date(reminder.createdAt);
      const endDate = new Date(createdAt);
      endDate.setDate(endDate.getDate() + Number(reminder.durationDays));

      if (now > endDate) {
        console.log(`🛑 Removing expired reminder: ${reminder.medicineName}`);
        await Reminder.findByIdAndDelete(reminder._id);
        continue;
      }

      // Trigger email if time matches
      for (const time of reminder.times) {
        if (time === currentTimeStr) {
          console.log(`✅ Reminder triggered for ${reminder.medicineName} → ${reminder.toEmail}`);

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: reminder.toEmail,
            subject: `Medicine Reminder: ${reminder.medicineName}`,
            text: `It's time to take your medicine: ${reminder.medicineName}`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent to ${reminder.toEmail}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in reminder scheduler:", err);
  }
};
