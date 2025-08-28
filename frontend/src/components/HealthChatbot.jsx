import React, { useState } from 'react';
import axios from 'axios';

const HealthChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

const sendMessage = async () => {
  if (!query.trim()) return;

  const newMessages = [...messages, { sender: 'user', text: query }];
  setMessages(newMessages);
  setQuery('');
  setLoading(true);

  try {
    const res = await axios.post('http://localhost:5000/ask-chatbot', { query }); // ✅ fixed

    const aiReply = res.data.response;
    setMessages([...newMessages, { sender: 'ai', text: aiReply }]);
  } catch (err) {
    setMessages([
      ...newMessages,
      { sender: 'ai', text: '❌ Sorry, something went wrong.' },
    ]);
  }

  setLoading(false);
};


  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-2xl flex flex-col">
        <div className="bg-teal-600 text-white text-xl font-bold px-6 py-4">
          💬 Ask MediBot – Your AI Health Guide
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] p-3 rounded-lg shadow-sm whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'ml-auto bg-blue-100 text-right'
                  : 'mr-auto bg-green-100 text-left'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="mr-auto bg-green-100 text-left p-3 rounded-lg shadow-sm max-w-[80%] italic text-gray-600">
              MediBot is typing...
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2 bg-white">
          <textarea
            rows="1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Ask about health, diet, disease, etc..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthChatbot;
