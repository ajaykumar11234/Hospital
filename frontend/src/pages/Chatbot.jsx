import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I’m your AI Doctor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = "demo-user"; // Replace with actual user session in real app
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_FLASK_BACKEND_URL;

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        user_id: userId,
        message: userMsg.text,
      });

      const botData = res.data;
      const botMsg = {
        sender: "bot",
        text: botData.response || "⚠️ Sorry, I didn't get a response.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, I’m having trouble right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const renderMessageContent = (msg) => {
    if (typeof msg.text === "object") {
      return (
        <div className="space-y-1">
          {msg.text.disease && <p><strong>Disease:</strong> {msg.text.disease}</p>}
          {msg.text.medications && (
            <p><strong>Medications:</strong> {msg.text.medications.join(", ")}</p>
          )}
          {msg.text.precautions && (
            <p><strong>Precautions:</strong> {msg.text.precautions.join(", ")}</p>
          )}
          {msg.text.note && <p>{msg.text.note}</p>}
        </div>
      );
    } else {
      return <p>{msg.text}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex justify-center items-center px-4">
      <div className="w-full sm:w-[95%] md:w-3/4 lg:w-2/3 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-4 shadow-md">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Doctor</h2>
            <p className="text-xs text-white/80">Online • 24/7 Assistance</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 bg-gradient-to-b from-white to-purple-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="bg-purple-100 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {renderMessageContent(msg)}
              </div>

              {msg.sender === "user" && (
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
          ))}

          {/* Bot Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Bot className="h-5 w-5 text-purple-500" />
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 py-3 bg-white border-t flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your symptoms or questions..."
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow hover:scale-105 transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
