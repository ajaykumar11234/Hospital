import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // ✅ local backend

const Chat = ({ username, appointmentId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [inCall, setInCall] = useState(false);

  // --- Video refs ---
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    if (!appointmentId) return;

    socket.emit("joinRoom", { appointmentId });

    socket.on("message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    // ✅ signaling listeners
    socket.on("offer", async (offer) => {
      if (!peerConnection.current) await initPeerConnection();

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { appointmentId, answer });
      setInCall(true);
    });

    socket.on("answer", async (answer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    return () => {
      socket.off("message");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [appointmentId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit(
        "chatMessage",
        { appointmentId, sender: username, text: message },
        (ack) => {
          if (ack?.ok) {
            setChat((prev) => [...prev, ack.data]);
          }
        }
      );
      setMessage("");
    }
  };

  // --- Init Peer Connection ---
  const initPeerConnection = async () => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { appointmentId, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    localStream.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, localStream)
    );
  };

  const startCall = async () => {
    setInCall(true);
    await initPeerConnection();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { appointmentId, offer });
  };

  return (
    <div className="p-4 border rounded w-96">
      <h2 className="text-lg font-bold mb-2">Live Chat + Video</h2>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto border p-2 mb-2">
        {chat.map((msg) => (
          <div key={msg._id}>
            <b>{msg.sender}:</b> {msg.text}{" "}
            <span className="text-xs">
              ({new Date(msg.createdAt).toLocaleTimeString()})
            </span>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={sendMessage} className="flex gap-2 mb-3">
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

      {/* ✅ Video Call Button */}
      <button
        onClick={startCall}
        className="bg-green-500 text-white px-3 py-1 rounded mb-3 w-full"
        disabled={inCall}
      >
        Start Video Call
      </button>

      {/* Video Screens */}
      {inCall && (
        <div className="flex flex-col gap-2">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full border rounded" />
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full border rounded" />
        </div>
      )}
    </div>
  );
};

export default Chat;
