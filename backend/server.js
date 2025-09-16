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

import { startReminderScheduler } from "./utils/reminderScheduler.js";
import ChatMessage from "./models/ChatMessage.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// ---------- DB + Cloudinary ----------
connectDB().then(() => {
  console.log("✅ MongoDB connected");
  startReminderScheduler();
});
connectCloudinary().catch((err) => console.error("❌ Cloudinary init error:", err));

// ---------- Allowed Origins ----------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://virtual-health-assistant-admin.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// ---------- Routers ----------
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/reminder", reminderRouter);
app.use("/api/video", videoRouter);
app.use("/api/medicines", medicineRouter);
app.use("/api/orders", orderRouter);

app.get("/", (req, res) => res.send("API Working Great.."));

// ---------- Socket.IO ----------
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const toClientDTO = (doc) => ({
  _id: doc._id,
  appointmentId: doc.appointmentId,
  sender: doc.sender,
  text: doc.text,
  createdAt: doc.createdAt,
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", ({ appointmentId }) => {
    if (!appointmentId) return;
    socket.join(appointmentId);
  });

  socket.on("chatMessage", async (data, ack) => {
    try {
      const { appointmentId, sender, text } = data;
      if (!appointmentId || !sender || !text?.trim()) return ack && ack({ ok: false, error: "Invalid message" });
      const saved = await ChatMessage.create({ appointmentId, sender, text });
      const msgToSend = toClientDTO(saved);
      io.to(appointmentId).emit("message", msgToSend);
      if (ack) ack({ ok: true, data: msgToSend });
    } catch (err) {
      console.error(err);
      if (ack) ack({ ok: false, error: "Failed to send message" });
    }
  });
});

server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
