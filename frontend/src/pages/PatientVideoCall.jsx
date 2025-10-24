// patient/PatientVideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:4000";
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const PatientVideoCall = () => {
  const { appointmentId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [inCall, setInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);

    pcRef.current = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("candidate", { appointmentId, candidate: event.candidate });
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
      })
      .catch((err) => console.error("Camera/Mic error:", err));

    socketRef.current.emit("joinVideo", { appointmentId, user: "patient" });

    socketRef.current.on("incomingCall", ({ caller }) => {
      setCaller(caller || "Doctor");
      setIncomingCall(true);
    });

    socketRef.current.on("startVideoCall", ({ caller }) => {
      // If patient initiated (isCaller true), create offer; otherwise wait for offer from caller
      if (isCaller) {
        createAndSendOffer();
      }
      setInCall(true);
    });

    socketRef.current.on("callDeclinedByPeer", ({ reason }) => {
      alert(`Call declined: ${reason || ""}`);
      cleanupAndRedirect();
    });

    socketRef.current.on("callEnded", ({ endedBy }) => {
      alert(`Call ended by ${endedBy || "other side"}`);
      cleanupAndRedirect();
    });

    socketRef.current.on("offer", async ({ sdp }) => {
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
      alert(`${user} left the call`);
      cleanupAndRedirect();
    });

    return () => {
      try {
        if (pcRef.current && pcRef.current.connectionState !== "closed") pcRef.current.close();
      } catch (e) {}
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, isCaller]);

  const createAndSendOffer = async () => {
    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", { appointmentId, sdp: offer, caller: "patient" });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  const startCall = () => {
    setIsCaller(true);
    socketRef.current.emit("callInitiate", { appointmentId, caller: "patient" });
    setInCall(true);
  };

  const acceptCall = () => {
    setIncomingCall(false);
    setInCall(true);
    setIsCaller(false);
    socketRef.current.emit("callAccepted", { appointmentId, caller });
    // server will emit startVideoCall which triggers offer creation by caller
  };

  const declineCall = () => {
    socketRef.current.emit("callDeclined", { appointmentId, reason: "declined-by-patient" });
    setIncomingCall(false);
    setInCall(false);
  };

  const hangUp = () => {
    socketRef.current.emit("endCall", { appointmentId, user: "patient" });
    cleanupAndRedirect();
  };

  const cleanupAndRedirect = () => {
    try {
      if (pcRef.current && pcRef.current.connectionState !== "closed") pcRef.current.close();
    } catch (e) {}
    if (socketRef.current) socketRef.current.emit("leaveVideo", { appointmentId, user: "patient" });
    window.location.href = `/chat/${appointmentId}`;
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
            <h1 className="text-white text-xl font-semibold">Video Consultation</h1>
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
        {/* Remote Video (Doctor) - Full Screen */}
        <div className="absolute inset-0 bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {!connected && !incomingCall && !inCall && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Not on call</p>
                <div className="mt-4">
                  <button onClick={startCall} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full">
                    Start Video Call
                  </button>
                </div>
              </div>
            </div>
          )}

          {incomingCall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
              <h2 className="text-white text-xl mb-4">{caller} is calling...</h2>
              <div className="flex gap-4">
                <button onClick={acceptCall} className="px-6 py-3 bg-green-600 text-white rounded-full">Accept</button>
                <button onClick={declineCall} className="px-6 py-3 bg-red-600 text-white rounded-full">Decline</button>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white text-sm font-medium">Doctor</span>
          </div>
        </div>

        {/* Local Video (Patient) - Picture in Picture */}
        <div className="absolute top-24 right-6 w-64 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black z-10">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white text-xs font-medium">You</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
          {/* Mic Toggle */}
          <button onClick={toggleMic} className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${micOn ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {micOn ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          {/* Camera Toggle */}
          <button onClick={toggleCam} className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${camOn ? 'bg-gray-700/80 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}>
            {camOn ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            )}
          </button>

          {/* End Call */}
          <button onClick={hangUp} className="group relative w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-red-500/50">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientVideoCall;
