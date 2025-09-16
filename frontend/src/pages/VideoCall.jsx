// pages/VideoCall.jsx
import React from "react";
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const { appointmentId } = useParams();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold mb-4">
        Video Consultation - Appointment #{appointmentId}
      </h2>
      {/* Later you’ll integrate WebRTC / Twilio / Jitsi here */}
      <div className="w-full max-w-3xl h-[70vh] bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
        <p>Video Call UI will appear here 🎥</p>
      </div>
    </div>
  );
};

export default VideoCall;
