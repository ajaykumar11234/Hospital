// doctor/DoctorVideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Mic, MicOff, Video as VideoIcon, VideoOff, Phone, PhoneOff, MessageSquare, ArrowLeft, Monitor, MoreVertical } from "lucide-react";

const SIGNALING_SERVER_URL = "http://localhost:4000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const DoctorVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  // UI states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [inCall, setInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const callStartTimeRef = useRef(null);

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
        localStreamRef.current = stream;
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
        callStartTimeRef.current = Date.now();
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

  // Call duration timer
  useEffect(() => {
    if (!connected) return;
    
    const interval = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connected]);

  // Auto-hide controls
  useEffect(() => {
    if (!inCall) return;
    
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [inCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      // Stop all local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }
      
      // Also stop tracks from video element if they exist
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject;
        stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        localVideoRef.current.srcObject = null;
      }
      
      // Close peer connection
      if (pcRef.current && pcRef.current.connectionState !== "closed") {
        pcRef.current.close();
        pcRef.current = null;
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }
    
    if (socketRef.current) socketRef.current.emit("leaveVideo", { appointmentId, user: "doctor" });
    
    // Redirect to doctor appointments
    navigate('/doctor/appointments');
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
  };

  const toggleCam = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCamOn(videoTrack.enabled);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${showControls || !inCall ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="p-2 hover:bg-white/10 rounded-full transition text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-white text-xl font-semibold">Doctor Consultation</h1>
              <p className="text-gray-300 text-sm mt-0.5">Appointment #{appointmentId.slice(-6)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connected && (
              <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">{formatDuration(callDuration)}</span>
                </div>
              </div>
            )}
            
            <button
              className="p-2 hover:bg-white/10 rounded-full transition text-white"
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="relative w-full h-full">
        {/* Remote Video (Full Screen) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* No Connection State */}
          {!connected && !incomingCall && !inCall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <VideoIcon className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-2">Ready to Start Call</h2>
                  <p className="text-gray-400 text-sm">Click the button below to initiate video consultation</p>
                </div>
                <button 
                  onClick={startCall} 
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span>Start Video Call</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Incoming Call Modal */}
          {incomingCall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
              <div className="text-center space-y-8 p-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <span className="text-4xl font-bold text-white">P</span>
                  </div>
                  <div className="absolute inset-0 w-32 h-32 bg-blue-500/30 rounded-full animate-ping mx-auto"></div>
                </div>
                <div>
                  <h2 className="text-white text-3xl font-bold mb-2">{caller} is calling...</h2>
                  <p className="text-gray-400">Incoming video consultation request</p>
                </div>
                <div className="flex gap-6 justify-center">
                  <button 
                    onClick={declineCall} 
                    className="group p-6 bg-red-500 hover:bg-red-600 rounded-full transition transform hover:scale-110 shadow-lg"
                  >
                    <PhoneOff className="h-8 w-8 text-white" />
                  </button>
                  <button 
                    onClick={acceptCall} 
                    className="group p-6 bg-green-500 hover:bg-green-600 rounded-full transition transform hover:scale-110 shadow-lg animate-bounce"
                  >
                    <Phone className="h-8 w-8 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Connection Status Badge */}
          {connected && (
            <div className="absolute top-24 left-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <span className="text-white text-sm font-medium">Patient</span>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className={`absolute transition-all duration-300 ${inCall ? 'top-24 right-6 w-72 h-52' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-72'} rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 z-10`}>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-white text-sm font-semibold">You (Doctor)</span>
          </div>
          {!camOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-12 w-12 text-white/50 mx-auto mb-2" />
                <span className="text-white/70 text-sm">Camera Off</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${showControls || !inCall ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center gap-4 p-8">
          {/* Microphone Toggle */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleMic}
              className={`group relative p-5 rounded-full transition-all duration-200 shadow-lg ${
                micOn 
                  ? "bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm" 
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>
            <span className="text-white text-xs font-medium">
              {micOn ? "Mute" : "Unmute"}
            </span>
          </div>

          {/* Camera Toggle */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleCam}
              className={`group relative p-5 rounded-full transition-all duration-200 shadow-lg ${
                camOn 
                  ? "bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm" 
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={camOn ? "Stop Video" : "Start Video"}
            >
              {camOn ? (
                <VideoIcon className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>
            <span className="text-white text-xs font-medium">
              {camOn ? "Stop Video" : "Start Video"}
            </span>
          </div>

          {/* Hang Up / End Call */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={hangUp}
              className="group relative p-5 rounded-full transition-all duration-200 shadow-lg transform hover:scale-110 bg-red-500 hover:bg-red-600"
              title="End call"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-xs font-medium">End Call</span>
          </div>

          {/* Chat */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => navigate(`/doctor/chat/${appointmentId}`)}
              className="group relative p-5 rounded-full bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm transition-all duration-200 shadow-lg"
              title="Open chat"
            >
              <MessageSquare className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-xs font-medium">Chat</span>
          </div>

          {/* Screen Share (placeholder) */}
          <div className="flex flex-col items-center gap-2">
            <button
              disabled={!inCall && !connected}
              className={`group relative p-5 rounded-full transition-all duration-200 shadow-lg ${
                !inCall && !connected
                  ? "bg-gray-600/50 cursor-not-allowed"
                  : "bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm"
              }`}
              title="Share screen"
            >
              <Monitor className="w-6 h-6 text-white" />
            </button>
            <span className="text-white text-xs font-medium">Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoCall;
