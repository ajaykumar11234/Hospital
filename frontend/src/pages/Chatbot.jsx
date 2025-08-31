import { useState } from "react";
import axios from "axios";
import { Send, Bot, User } from "lucide-react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I’m your AI Doctor. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = "demo-user"; // Replace with actual user session in real app

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", {
        user_id: userId,
        message: userMsg.text,
      });

      const botData = res.data;

      const botMsg = {
        sender: "bot",
        text: botData.response || "⚠️ Sorry, I didn't get a response from the server.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        sender: "bot",
        text: "⚠️ Sorry, I’m having trouble right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4 border-b pb-3">
          <Bot className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">AI Doctor Chatbot</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <Bot className="h-6 w-6 text-purple-500 flex-shrink-0" />
              )}

              <div
                className={`px-4 py-2 rounded-xl max-w-[75%] shadow ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {msg.sender === "user" && (
                <User className="h-6 w-6 text-blue-500 flex-shrink-0" />
              )}
            </div>
          ))}
          {loading && (
            <p className="text-gray-500 italic">🤖 Thinking...</p>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your symptoms or questions..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl shadow hover:scale-105 transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
