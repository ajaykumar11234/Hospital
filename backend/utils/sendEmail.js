// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or "outlook", "yahoo", or use host/port for SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    await transporter.sendMail({
      from: `"Virtual Health Assistant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

export default sendEmail;
