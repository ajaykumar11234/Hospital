import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Sparkles, Heart, Activity } from "lucide-react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm your AI Health Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = "demo-user"; // Replace with actual user session in real app
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_FLASK_BACKEND_URL;

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex justify-center items-center px-4 py-6">
      <div className="w-full sm:w-[95%] md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col h-[90vh] overflow-hidden animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Bot className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                AI Health Assistant
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Online • Available 24/7
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs">
            <Heart className="h-4 w-4 text-red-300" />
            <span>Always here to help</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-3 animate-in slide-in-from-bottom duration-300 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {msg.sender === "bot" && (
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 rounded-full shadow-md">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              )}

              <div
                className={`px-5 py-3.5 rounded-2xl max-w-[80%] shadow-md text-sm leading-relaxed transition-all hover:shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                }`}
              >
                {renderMessageContent(msg)}
              </div>

              {msg.sender === "user" && (
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-2.5 rounded-full shadow-md">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
          ))}

          {/* Bot Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 rounded-full shadow-md">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div className="bg-white px-5 py-3.5 rounded-2xl rounded-bl-sm shadow-md border border-gray-100">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 shadow-inner">
          <div className="flex items-center gap-3 bg-white rounded-full border-2 border-gray-200 focus-within:border-blue-500 transition-all shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms or ask a health question..."
              disabled={loading}
              className="flex-1 px-5 py-4 rounded-full focus:outline-none text-sm bg-transparent placeholder:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`mr-2 p-3.5 rounded-full shadow-lg transition-all duration-200 ${
                loading || !input.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-110 active:scale-95'
              }`}
            >
              <Send className={`h-5 w-5 text-white ${loading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            AI responses are for informational purposes only. Always consult a doctor.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
