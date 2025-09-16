// utils/email.js
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
    console.log("📧 Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err;
  }
};
