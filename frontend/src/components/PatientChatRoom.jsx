import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AppContext } from "../context/AppContextProvider";
import axios from "axios";
import { Send, Video, ArrowLeft, User } from "lucide-react";

const PatientChatRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AppContext);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  const messagesEndRef = useRef(null);

  // ✅ Load backend URL from .env (Vite)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Helper function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/chat/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        
        // Fetch doctor info from appointment
        const appointmentRes = await axios.get(
          `${BACKEND_URL}/api/user/appointments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const appointment = appointmentRes.data.find(
          (apt) => apt._id === appointmentId
        );
        if (appointment?.docId) {
          setDoctorInfo(appointment.docId);
        }
      } catch (err) {
        console.error("❌ Failed to load chat history:", err);
      }
    };
    if (token) fetchHistory();
  }, [appointmentId, token, BACKEND_URL]);

  // Socket.IO connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(BACKEND_URL, {
      query: { token },
    });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { appointmentId });

    newSocket.on("message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    // Typing indicators
    newSocket.on("typing", ({ sender }) => {
      if (sender === "doctor") setTyping(true);
    });
    newSocket.on("stopTyping", ({ sender }) => {
      if (sender === "doctor") setTyping(false);
    });

    return () => newSocket.disconnect();
  }, [appointmentId, token, BACKEND_URL]);

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

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/my-appointments")}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Back to appointments"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {doctorInfo?.image ? (
                    <img
                      src={doctorInfo.image}
                      alt={doctorInfo.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-base">
                    {doctorInfo?.name || "Doctor"}
                  </h2>
                  <p className="text-xs text-green-100">
                    {doctorInfo?.speciality || "Healthcare Professional"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/video/${appointmentId}`)}
              className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium text-sm"
            >
              <Video className="w-4 h-4" />
              Video Call
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation with your doctor</p>
          </div>
        ) : (
          Object.keys(groupedMessages).map((date) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium shadow-sm border border-gray-200">
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                </div>
              </div>

              {/* Messages for this date */}
              {groupedMessages[date].map((msg, idx) => {
                const isPatient = msg.sender === "patient";
                const showAvatar =
                  idx === 0 ||
                  groupedMessages[date][idx - 1]?.sender !== msg.sender;

                return (
                  <div
                    key={msg._id}
                    className={`flex gap-3 mb-4 ${
                      isPatient ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Doctor Avatar (left side) */}
                    {!isPatient && (
                      <div className="flex-shrink-0 self-end">
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            {doctorInfo?.image ? (
                              <img
                                src={doctorInfo.image}
                                alt="Doctor"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="relative max-w-[70%]">
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-md ${
                          isPatient
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed break-words">
                          {msg.text}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isPatient ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-[11px] ${
                              isPatient ? "text-green-100" : "text-gray-500"
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              {doctorInfo?.image ? (
                <img
                  src={doctorInfo.image}
                  alt="Doctor"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim()
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatRoom;
