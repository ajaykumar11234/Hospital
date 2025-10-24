import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorChatRoom = () => {
  const { appointmentId } = useParams();
  const { dToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/chat/${appointmentId}`, {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load chat history:", err);
      }
    };
    if (dToken) fetchHistory();
  }, [appointmentId, dToken]);

  useEffect(() => {
    if (!dToken) return;

    const newSocket = io(BACKEND_URL, { query: { token: dToken } });
    setSocket(newSocket);
    newSocket.emit("joinRoom", { appointmentId });

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("typing", ({ sender }) => {
      if (sender === "patient") setTyping(true);
    });
    newSocket.on("stopTyping", ({ sender }) => {
      if (sender === "patient") setTyping(false);
    });

    return () => newSocket.disconnect();
  }, [appointmentId, dToken]);

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    if (e.target.value) socket.emit("typing", { appointmentId, sender: "doctor" });
    else socket.emit("stopTyping", { appointmentId, sender: "doctor" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    const msgData = { appointmentId, sender: "doctor", text: newMessage };
    socket.emit("chatMessage", msgData);
    setMessages((prev) => [...prev, { ...msgData, optimistic: true, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() }]);
    setNewMessage("");
    socket.emit("stopTyping", { appointmentId, sender: "doctor" });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
        <h2>Chat with Patient (#{appointmentId})</h2>
        <button
          onClick={() => navigate(`/video/doctor/${appointmentId}`)}
          className="px-3 py-1 bg-green-500 rounded"
        >
          🎥 Start Video Call
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs break-words ${msg.sender === "doctor" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"} ${msg.optimistic ? "opacity-70" : ""}`}>
              <p>{msg.text}</p>
              <span className="text-xs mt-1 opacity-70 block text-right">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}</span>
            </div>
          </div>
        ))}
        {typing && <p className="text-sm text-gray-500 italic">Patient is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
      </div>
    </div>
  );
};

export default DoctorChatRoom;
