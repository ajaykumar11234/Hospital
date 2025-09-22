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

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `https://virtual-health-assistant-backend.onrender.com/api/chat/${appointmentId}`,
          { headers: { Authorization: `Bearer ${dToken}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    if (dToken) fetchHistory();
  }, [appointmentId, dToken]);

  // Socket.IO connection
  useEffect(() => {
    if (!dToken) return;

    const newSocket = io("https://virtual-health-assistant-backend.onrender.com", { query: { token: dToken } });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { appointmentId });

    // ✅ Replace optimistic message when server confirms
    newSocket.on("message", (msg) => {
      setMessages((prev) => {
        const optimistic = prev.find(
          (m) =>
            m.sender === msg.sender &&
            m.text === msg.text &&
            m._id?.startsWith("temp-")
        );
        if (optimistic) {
          return prev.map((m) => (m._id === optimistic._id ? msg : m));
        }
        return [...prev, msg];
      });
    });

    newSocket.on("typing", ({ sender }) => sender === "patient" && setTyping(true));
    newSocket.on("stopTyping", ({ sender }) => sender === "patient" && setTyping(false));

    return () => newSocket.disconnect();
  }, [appointmentId, dToken]);

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    if (e.target.value) {
      socket.emit("typing", { appointmentId, sender: "doctor" });
    } else {
      socket.emit("stopTyping", { appointmentId, sender: "doctor" });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const tempId = `temp-${Date.now()}`;
    const msgData = {
      appointmentId,
      sender: "doctor",
      text: newMessage,
      _id: tempId,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    // Optimistic UI
    setMessages((prev) => [...prev, msgData]);

    // Send to server
    socket.emit("chatMessage", msgData);

    setNewMessage("");
    socket.emit("stopTyping", { appointmentId, sender: "doctor" });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">
          Chat with Patient (Appointment #{appointmentId})
        </h2>
        <button
          onClick={() => navigate(`/video/${appointmentId}`)}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm sm:text-base"
        >
          📹 Start Video Call
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  msg.sender === "doctor"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                } ${msg.optimistic ? "opacity-70" : ""}`}
              >
                <p>{msg.text}</p>
                <span className="text-xs mt-1 opacity-70 block text-right">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          ))
        )}
        {typing && <p className="text-sm text-gray-500 italic">Patient is typing...</p>}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DoctorChatRoom;
