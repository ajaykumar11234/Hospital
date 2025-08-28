import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../context/AppContextProvider";

const PatientChatRoom = () => {
  const { appointmentId } = useParams();
  const { token, user } = useContext(AppContext); 
  // 👆 make sure `user` contains {_id, name} in AppContext

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect socket
  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:4000", {
      query: { token },
    });

    setSocket(newSocket);

    // Join appointment room
    newSocket.emit("joinRoom", { appointmentId });

    // Listen for messages from backend
    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [appointmentId, token]);

  // Send new message
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const msgData = {
      appointmentId,
      senderId: user?._id || "temp-patient-id",
      senderName: user?.name || "Patient",
      senderRole: "patient",
      text: newMessage,
    };

    // Emit to backend
    socket.emit("chatMessage", msgData, (ack) => {
      if (ack?.ok) {
        setMessages((prev) => [...prev, ack.data]); // server-confirmed msg
        setNewMessage("");
      } else {
        console.error("Message send failed:", ack?.error);
      }
    });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white shadow-lg rounded-lg border">
      {/* Header */}
      <div className="p-4 bg-green-600 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold">
          Chat with Doctor (Appointment #{appointmentId})
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderRole === "patient" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.senderRole === "patient"
                    ? "bg-green-500 text-white rounded-br-none"
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

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PatientChatRoom;
