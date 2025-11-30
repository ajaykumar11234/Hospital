import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import reminderRouter from "./routes/reminderRoute.js";
import videoRouter from "./routes/videoRoute.js";
import medicineRouter from "./routes/medicineRoute.js";
import orderRouter from "./routes/orderRoute.js";
import healthRecordRouter from "./routes/healthRecordRoute.js";

import { checkReminders } from "./utils/reminderScheduler.js";
import { initVideoSocket } from "./utils/videoSocket.js";
import { initChatSocket } from "./utils/chatSocket.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ---------- DB + Cloudinary ----------
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

connectCloudinary().catch((err) => console.error("❌ Cloudinary init error:", err));

// ---------- Allowed Origins ----------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://virtual-health-assistant-admin.onrender.com",
  "https://virtual-health-assistant-app.onrender.com"
];
if (process.env.FRONTEND_ORIGIN) allowedOrigins.push(process.env.FRONTEND_ORIGIN);

// ---------- Middlewares ----------
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ---------- API Routes ----------
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/reminder", reminderRouter);
app.use("/api/video", videoRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/orders", orderRouter);
app.use("/api/health-records", healthRecordRouter);

// ---------- Health + Reminder ----------
app.get("/api/run-reminder-check", async (req, res) => {
  await checkReminders();
  res.send("✅ Reminder check completed");
});

app.get("/", (req, res) => {
  res.send("✅ MediConnect API Working Fine");
});

// ---------- Socket.IO ----------
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---------- Initialize Socket Modules ----------
initVideoSocket(io);
initChatSocket(io);

// ---------- Start Server ----------
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 MediConnect Server + Socket.IO running on port ${port}`);
});
