// doctor/DoctorVideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:4000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const DoctorVideoCall = () => {
  const { appointmentId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  // UI states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [inCall, setInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);

    // create RTCPeerConnection
    pcRef.current = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // remote stream
    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    // ICE candidate -> send to backend
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("candidate", {
          appointmentId,
          candidate: event.candidate,
        });
      }
    };

    // get local media and add to peer connection
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
      })
      .catch((err) => console.error("Camera/Mic error:", err));

    // join video room for presence & invitations
    socketRef.current.emit("joinVideo", { appointmentId, user: "doctor" });

    // incoming call (if someone initiated)
    socketRef.current.on("incomingCall", ({ caller }) => {
      console.log("incomingCall:", caller);
      setCaller(caller || "Peer");
      setIncomingCall(true);
    });

    // when someone accepts the call (or callAccepted continues)
    socketRef.current.on("startVideoCall", ({ caller }) => {
      console.log("startVideoCall received, caller:", caller);
      // if I'm the caller -> create offer, otherwise wait for offer
      if (isCaller) {
        createAndSendOffer();
      } else {
        // callee: wait for incoming offer
      }
      setInCall(true);
    });

    socketRef.current.on("callDeclinedByPeer", ({ reason }) => {
      alert(`Call declined by other side${reason ? `: ${reason}` : ""}`);
      cleanupAndRedirect();
    });

    socketRef.current.on("callEnded", ({ endedBy }) => {
      alert(`Call ended by ${endedBy || "other side"}`);
      cleanupAndRedirect();
    });

    socketRef.current.on("offer", async ({ sdp, caller }) => {
      console.log("offer received");
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit("answer", { appointmentId, sdp: answer });
        setConnected(true);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socketRef.current.on("answer", async ({ sdp }) => {
      console.log("answer received");
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        setConnected(true);
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    });

    socketRef.current.on("candidate", async ({ candidate }) => {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socketRef.current.on("user-left", ({ user }) => {
      console.log("user-left", user);
      alert(`${user} left the call`);
      cleanupAndRedirect();
    });

    return () => {
      // cleanup on unmount
      if (pcRef.current && pcRef.current.connectionState !== "closed") {
        try {
          pcRef.current.close();
        } catch (e) {}
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, isCaller]);

  // Create offer (caller)
  const createAndSendOffer = async () => {
    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", { appointmentId, sdp: offer, caller: "doctor" });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  // Start call (doctor initiates)
  const startCall = () => {
    setIsCaller(true);
    socketRef.current.emit("callInitiate", { appointmentId, caller: "doctor" });
    // show small feedback, caller will actually start offer once someone accepts (server -> startVideoCall)
    setInCall(true);
  };

  // Accept incoming call (doctor is callee)
  const acceptCall = () => {
    setIncomingCall(false);
    setInCall(true);
    setIsCaller(false);
    socketRef.current.emit("callAccepted", { appointmentId, caller }); // notify server
    // server emits startVideoCall to room -> if caller it will create offer
  };

  const declineCall = () => {
    socketRef.current.emit("callDeclined", { appointmentId, reason: "declined-by-doctor" });
    setIncomingCall(false);
    setInCall(false);
  };

  const hangUp = () => {
    // close local peer and notify server
    socketRef.current.emit("endCall", { appointmentId, user: "doctor" });
    cleanupAndRedirect();
  };

  const cleanupAndRedirect = () => {
    try {
      if (pcRef.current && pcRef.current.connectionState !== "closed") pcRef.current.close();
    } catch (e) {}
    if (socketRef.current) socketRef.current.emit("leaveVideo", { appointmentId, user: "doctor" });
    // Redirect to doctor chat page
    window.location.href = `/doctor/chat/${appointmentId}`;
  };

  const toggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !micOn;
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !camOn;
    setCamOn(!camOn);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-white text-xl font-semibold">Doctor Video Consultation</h1>
            <p className="text-gray-300 text-sm mt-1">Appointment ID: {appointmentId}</p>
          </div>

          {connected && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!connected && !incomingCall && !inCall && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={startCall} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full">
                Start Video Call
              </button>
            </div>
          )}

          {incomingCall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
              <h2 className="text-white text-xl mb-4">{caller} is calling...</h2>
              <div className="flex gap-4">
                <button onClick={acceptCall} className="px-6 py-3 bg-green-600 text-white rounded-full">Accept</button>
                <button onClick={declineCall} className="px-6 py-3 bg-red-600 text-white rounded-full">Decline</button>
              </div>
            </div>
          )}

          {connected && (
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm">
              Patient
            </div>
          )}
        </div>

        {/* Local PiP */}
        <div className="absolute top-24 right-6 w-64 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black z-10">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white text-xs font-medium">You</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      {inCall && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
            <button onClick={toggleMic} className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${micOn ? "bg-gray-700/80 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {micOn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11m0 0a4 4 0 004 4h0a4 4 0 004-4V5m-8 7a4 4 0 01-4 4H4a4 4 0 01-4-4V5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                )}
              </svg>
            </button>

            <button onClick={toggleCam} className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${camOn ? "bg-gray-700/80 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <button onClick={hangUp} className="group relative w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVideoCall;
