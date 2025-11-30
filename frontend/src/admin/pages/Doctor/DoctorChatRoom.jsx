import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { Send, Video, ArrowLeft, FileText, Image, Paperclip, Smile } from "lucide-react";

const DoctorChatRoom = () => {
  const { appointmentId } = useParams();
  const { dToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
    
    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (e.target.value) {
      socket.emit("typing", { appointmentId, sender: "doctor" });
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { appointmentId, sender: "doctor" });
      }, 2000);
    } else {
      socket.emit("stopTyping", { appointmentId, sender: "doctor" });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    const msgData = { appointmentId, sender: "doctor", text: newMessage };
    socket.emit("chatMessage", msgData);
    setMessages((prev) => [...prev, { ...msgData, optimistic: true, _id: `temp-${Date.now()}`, createdAt: new Date().toISOString() }]);
    setNewMessage("");
    socket.emit("stopTyping", { appointmentId, sender: "doctor" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">P</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="font-semibold text-lg">Patient Consultation</h2>
                <p className="text-sm text-blue-100">Appointment #{appointmentId.slice(-6)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/doctor/video/${appointmentId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/20"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Video Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center justify-center my-4">
              <div className="bg-white px-4 py-1 rounded-full shadow-sm border border-gray-200">
                <span className="text-xs text-gray-600 font-medium">
                  {formatDate(msgs[0]?.createdAt)}
                </span>
              </div>
            </div>
            
            {msgs.map((msg, idx) => {
              const isDoctor = msg.sender === "doctor";
              const showAvatar = idx === 0 || msgs[idx - 1]?.sender !== msg.sender;
              
              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 mb-3 ${isDoctor ? "justify-end" : "justify-start"}`}
                >
                  {!isDoctor && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      P
                    </div>
                  )}
                  {!isDoctor && !showAvatar && <div className="w-8" />}
                  
                  <div className={`flex flex-col max-w-[70%] ${isDoctor ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isDoctor
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                      } ${msg.optimistic ? "opacity-70" : ""}`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    </div>
                    <span className={`text-xs mt-1 ${isDoctor ? "text-gray-500" : "text-gray-400"}`}>
                      {formatTime(msg.createdAt)}
                      {msg.optimistic && " • Sending..."}
                    </span>
                  </div>
                  
                  {isDoctor && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      D
                    </div>
                  )}
                  {isDoctor && !showAvatar && <div className="w-8" />}
                </div>
              );
            })}
          </div>
        ))}
        
        {typing && (
          <div className="flex items-center gap-2 ml-10">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <button
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <input
                type="text"
                value={newMessage}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            
            <button
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-full transition shadow-md ${
                newMessage.trim()
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorChatRoom;
