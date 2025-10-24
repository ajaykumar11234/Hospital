// utils/chatSocket.js
import ChatMessage from "../models/ChatMessage.js";
import { encrypt, decrypt } from "./../utils/cryptoUtils.js";

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ User connected (Chat Socket):", socket.id);

    const toClientDTO = (doc) => ({
      _id: doc._id,
      appointmentId: doc.appointmentId,
      sender: doc.sender,
      text: doc.text ? decrypt(doc.text) : "",
      createdAt: doc.createdAt,
    });

    // ---------- Join Chat Room ----------
    socket.on("joinRoom", ({ appointmentId }) => {
      if (!appointmentId) return;
      socket.join(appointmentId);
      console.log(`💬 ${socket.id} joined chat room ${appointmentId}`);
    });

    // ---------- Chat Message ----------
    socket.on("chatMessage", async (data, ack) => {
      try {
        const { appointmentId, sender, text } = data;
        if (!appointmentId || !sender || !text?.trim()) {
          if (ack) ack({ ok: false, error: "Invalid message" });
          return;
        }

        const encryptedText = encrypt(text.trim());
        const saved = await ChatMessage.create({
          appointmentId,
          sender,
          text: encryptedText,
        });

        const msgToSend = toClientDTO(saved);
        io.to(appointmentId).emit("message", msgToSend);
        if (ack) ack({ ok: true, data: msgToSend });
      } catch (err) {
        console.error("❌ chatMessage error:", err);
        if (ack) ack({ ok: false, error: "Failed to send message" });
      }
    });

    // ---------- Typing Indicators ----------
    socket.on("typing", ({ appointmentId, sender }) => {
      socket.to(appointmentId).emit("typing", { sender });
    });

    socket.on("stopTyping", ({ appointmentId, sender }) => {
      socket.to(appointmentId).emit("stopTyping", { sender });
    });

    socket.on("disconnect", () => {
      console.log("❌ Chat Socket disconnected:", socket.id);
    });
  });
};
