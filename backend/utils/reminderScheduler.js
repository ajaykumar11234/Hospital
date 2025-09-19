import Reminder from "../models/reminderModel.js";
import nodemailer from "nodemailer";

export const checkReminders = async () => {
  try {
    const now = new Date();
    // Always use IST (Asia/Kolkata) for time calculations
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = istDate.getHours();
    const currentMinute = istDate.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    // Email transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const reminders = await Reminder.find({});
    console.log(`🔎 Checking ${reminders.length} reminders at IST ${currentTimeStr}`);

    for (const reminder of reminders) {
      // Expiry checking (IST)
      const createdAt = new Date(new Date(reminder.createdAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const endDate = new Date(createdAt);
      endDate.setDate(endDate.getDate() + Number(reminder.durationDays));

      if (istDate > endDate) {
        console.log(`🛑 Removing expired reminder: ${reminder.medicineName}`);
        await Reminder.findByIdAndDelete(reminder._id);
        continue;
      }

      // Trigger email if time matches (IST comparison)
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
