// --------------------- server.js ---------------------
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
import ChatMessage from "./models/ChatMessage.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ---------- DB + Cloudinary ----------
connectDB().catch((err) => console.error("❌ DB connection error:", err));
connectCloudinary().catch((err) =>
  console.error("❌ Cloudinary init error:", err)
);

// ---------- Dynamic CORS Helper ----------
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // allow tools like Postman / curl
      return callback(null, true);
    }

    if (
      origin.startsWith("http://localhost:") || // allow any localhost port
      origin.endsWith(".onrender.com") || // allow all Render subdomains
      (process.env.FRONTEND_ORIGIN && origin === process.env.FRONTEND_ORIGIN)
    ) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// ---------- Middlewares ----------
app.use(express.json());
app.use(cors(corsOptions));

// ---------- API Routes ----------
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

app.get("/", (req, res) => {
  res.send("API Working Great..");
});

// ---------- Socket.IO setup ----------
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// ---------- Helper: normalize messages ----------
const toClientDTO = (doc) => ({
  _id: doc._id,
  appointmentId: doc.appointmentId,
  sender: doc.sender,
  text: doc.text,
  createdAt: doc.createdAt,
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // ---------- Join Room ----------
  socket.on("joinRoom", ({ appointmentId }) => {
    if (!appointmentId) return;
    socket.join(appointmentId);
    console.log(`➡️ ${socket.id} joined room ${appointmentId}`);
  });

  // ---------- Handle chat messages ----------
  socket.on("chatMessage", async (data, ack) => {
    try {
      const { appointmentId, sender, text } = data;
      if (!appointmentId || !sender || !text?.trim()) {
        if (ack) ack({ ok: false, error: "Invalid message" });
        return;
      }

      // Save message to DB
      const saved = await ChatMessage.create({ appointmentId, sender, text });
      const msgToSend = toClientDTO(saved);

      // Broadcast to the room
      io.to(appointmentId).emit("message", msgToSend);

      // Acknowledge sender
      if (ack) ack({ ok: true, data: msgToSend });
    } catch (err) {
      console.error("❌ chatMessage error:", err);
      if (ack) ack({ ok: false, error: "Failed to send message" });
    }
  });

  // ---------- Typing indicators ----------
  socket.on("typing", ({ appointmentId, sender }) => {
    socket.to(appointmentId).emit("typing", { sender });
  });

  socket.on("stopTyping", ({ appointmentId, sender }) => {
    socket.to(appointmentId).emit("stopTyping", { sender });
  });

  // ---------- Disconnect ----------
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ---------- Start server ----------
server.listen(port, () => {
  console.log(`🚀 Server + Socket.IO running on port ${port}`);
});
