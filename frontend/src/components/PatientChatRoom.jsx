import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";

const PatientChatRoom = () => {
  const { appointmentId } = useParams();
  const { token } = useContext(AppContext);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/chat/${appointmentId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();
  }, [appointmentId]);

  // Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:4000", { query: { token } });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { appointmentId });

    newSocket.on("message", msg => setMessages(prev => [...prev, msg]));

    // Typing indicator from doctor
    newSocket.on("typing", ({ sender }) => sender === "doctor" && setTyping(true));
    newSocket.on("stopTyping", ({ sender }) => sender === "doctor" && setTyping(false));

    return () => newSocket.disconnect();
  }, [appointmentId, token]);

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;

    if (e.target.value) {
      socket.emit("typing", { appointmentId, sender: "patient" });
    } else {
      socket.emit("stopTyping", { appointmentId, sender: "patient" });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const msgData = { appointmentId, sender: "patient", text: newMessage };

    socket.emit("chatMessage", msgData);
    setNewMessage("");
    socket.emit("stopTyping", { appointmentId, sender: "patient" });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      <div className="p-4 bg-green-600 text-white rounded-t-lg">
        <h2>Chat with Doctor (Appointment #{appointmentId})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0
          ? <p className="text-center text-gray-500">No messages yet...</p>
          : messages.map(msg => (
            <div key={msg._id} className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === "patient" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-900"}`}>
                <p>{msg.text}</p>
                <span className="text-xs mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))
        }
        {typing && <p className="text-sm text-gray-500 italic">Doctor is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Send
        </button>
      </div>
    </div>
  );
};

export default PatientChatRoom;
