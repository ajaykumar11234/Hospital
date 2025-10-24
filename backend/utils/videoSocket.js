// utils/videoSocket.js
export const initVideoSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Video Socket connected:", socket.id);

    // join a video room (used for presence)
    socket.on("joinVideo", ({ appointmentId, user }) => {
      const room = `video-${appointmentId}`;
      socket.join(room);
      console.log(`${user} joined ${room} (${socket.id})`);
      // notify others that someone joined (optional)
      socket.to(room).emit("user-joined", { user, socketId: socket.id });
    });

    // Caller initiates a call -> notify other party in the room
    socket.on("callInitiate", ({ appointmentId, caller }) => {
      const room = `video-${appointmentId}`;
      console.log(`${caller} initiated call for ${appointmentId}`);
      // send incoming call to everyone else in room
      socket.to(room).emit("incomingCall", { caller });
      // also notify caller that initiation succeeded
      socket.emit("callInitiated");
    });

    // When callee accepts, tell everyone to start call (caller will create offer)
    socket.on("callAccepted", ({ appointmentId, caller }) => {
      const room = `video-${appointmentId}`;
      console.log(`Call accepted for ${appointmentId} (caller: ${caller})`);
      io.to(room).emit("startVideoCall", { caller });
    });

    // When callee declines -> inform caller(s)
    socket.on("callDeclined", ({ appointmentId, reason }) => {
      const room = `video-${appointmentId}`;
      console.log(`Call declined in ${appointmentId} — reason: ${reason || "no-reason"}`);
      io.to(room).emit("callDeclinedByPeer", { reason });
    });

    // WebRTC offer/answer/candidate relays
    socket.on("offer", ({ appointmentId, sdp, caller }) => {
      const room = `video-${appointmentId}`;
      console.log(`offer for ${appointmentId} from ${caller || "unknown"}`);
      socket.to(room).emit("offer", { sdp, caller });
    });

    socket.on("answer", ({ appointmentId, sdp }) => {
      const room = `video-${appointmentId}`;
      console.log(`answer for ${appointmentId}`);
      socket.to(room).emit("answer", { sdp });
    });

    socket.on("candidate", ({ appointmentId, candidate }) => {
      const room = `video-${appointmentId}`;
      socket.to(room).emit("candidate", { candidate });
    });

    // End call - notify both sides
    socket.on("endCall", ({ appointmentId, user }) => {
      const room = `video-${appointmentId}`;
      console.log(`${user} ended call for ${appointmentId}`);
      io.to(room).emit("callEnded", { endedBy: user });
    });

    // Leave video room
    socket.on("leaveVideo", ({ appointmentId, user }) => {
      const room = `video-${appointmentId}`;
      socket.leave(room);
      console.log(`${user} left ${room}`);
      socket.to(room).emit("user-left", { user });
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} reason: ${reason}`);
    });
  });
};
