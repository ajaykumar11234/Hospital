// --------------------- server.js ---------------------
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import chatRouter from './routes/chatRoute.js';
import ChatMessage from './models/ChatMessage.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ---------- DB + Cloudinary ----------
connectDB();
connectCloudinary();

// ---------- Allowed Origins ----------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

// ---------- Express Middlewares ----------
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ---------- API Routes ----------
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.send("API Working Great..");
});

// ---------- Socket.IO setup ----------
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---------- Helper: Normalize messages for frontend ----------
const toClientDTO = (doc) => ({
  _id: doc._id,
  appointmentId: doc.appointmentId,
  senderId: doc.senderId,
  senderName: doc.senderName,
  senderRole: doc.senderRole,
  text: doc.message,
  createdAt: doc.createdAt,
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // ---------- Join Room ----------
  socket.on("joinRoom", async ({ appointmentId }) => {
    if (!appointmentId) return;

    socket.join(appointmentId);
    console.log(`➡️ ${socket.id} joined room ${appointmentId}`);

    // Load chat history and send to the newly joined user
    try {
      const history = await ChatMessage.find({ appointmentId }).sort({ createdAt: 1 });
      const dtoHistory = history.map(toClientDTO);
      socket.emit("history", dtoHistory);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  });

  // ---------- Handle chat messages ----------
  socket.on("chatMessage", async (payload, ack) => {
    try {
      const { appointmentId, senderId, senderName, senderRole, text } = payload || {};

      // Validate payload
      if (!appointmentId || !senderId || !senderName || !senderRole || !text?.trim()) {
        if (ack) ack({ ok: false, error: "Invalid payload" });
        return;
      }

      // Save message to DB
      const saved = await ChatMessage.create({
        appointmentId,
        senderId,
        senderName,
        senderRole,
        message: text.trim(),
      });

      const dto = toClientDTO(saved);

      // Broadcast message to the room
      io.to(appointmentId).emit("message", dto);

      // Acknowledge sender
      if (ack) ack({ ok: true, data: dto });
    } catch (err) {
      console.error("chatMessage error:", err);
      if (ack) ack({ ok: false, error: "Failed to send message" });
    }
  });

  // ---------- Disconnect ----------
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ---------- Start server ----------
server.listen(port, () => {
  console.log('🚀 Server + Socket.IO running on port', port);
});
