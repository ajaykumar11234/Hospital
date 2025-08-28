import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // backend URL

const Chat = ({ username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit("join", username);

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("userList", (data) => {
      setUsers(data);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userList");
    };
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("sendMessage", { text: message });
      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded w-96">
      <h2 className="text-lg font-bold mb-2">Live Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-2">
        {chat.map((msg, i) => (
          <div key={i}>
            <b>{msg.user}:</b> {msg.text} <span className="text-xs">({new Date(msg.time).toLocaleTimeString()})</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-1 rounded"
          placeholder="Type message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-2 rounded">
          Send
        </button>
      </form>
      <div className="mt-2">
        <b>Online Users:</b> {users.join(", ")}
      </div>
    </div>
  );
};

export default Chat;
