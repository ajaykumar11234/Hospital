import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorChatRoom = () => {
  const { appointmentId } = useParams();
  const { dToken } = useContext(DoctorContext);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/chat/${appointmentId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [appointmentId]);

  // Socket.IO connection
  useEffect(() => {
    if (!dToken) return;

    const newSocket = io("http://localhost:4000", { query: { token: dToken } });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { appointmentId });

    newSocket.on("message", msg => setMessages(prev => [...prev, msg]));

    // Typing indicator from patient
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

    const msgData = { appointmentId, sender: "doctor", text: newMessage };

    socket.emit("chatMessage", msgData);
    setNewMessage("");
    socket.emit("stopTyping", { appointmentId, sender: "doctor" });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      <div className="p-4 bg-blue-600 text-white rounded-t-lg">
        <h2>Chat with Patient (Appointment #{appointmentId})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0
          ? <p className="text-center text-gray-500">No messages yet...</p>
          : messages.map(msg => (
            <div key={msg._id} className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === "doctor" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                <p>{msg.text}</p>
                <span className="text-xs mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))
        }
        {typing && <p className="text-sm text-gray-500 italic">Patient is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default DoctorChatRoom;
