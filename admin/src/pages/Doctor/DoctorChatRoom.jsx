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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 📌 Fetch chat history once on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/chat/${appointmentId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, [appointmentId]);

  // 📌 Connect to socket
  useEffect(() => {
    if (!dToken) return;

    const newSocket = io("http://localhost:4000", {
      query: { token: dToken },
    });

    setSocket(newSocket);
    newSocket.emit("joinRoom", { appointmentId, role: "doctor" });

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [appointmentId, dToken]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const msgData = {
      appointmentId,
      sender: "doctor",
      text: newMessage,
      time: new Date().toISOString(),
    };

    socket.emit("chatMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      <div className="p-4 bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold">
          Chat with Patient (Appointment #{appointmentId})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "doctor" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === "doctor"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="block text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt || msg.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
