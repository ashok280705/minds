import { Server } from "socket.io";

let io;
const userSockets = new Map(); // Store user socket connections

export function initIO(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 New Socket.IO:", socket.id);

    socket.on("register-doctor", ({ doctorId }) => {
      console.log(`Doctor ${doctorId} joined`);
      socket.join(doctorId);
    });

    socket.on("register-user", ({ userId }) => {
      console.log(`👤 User ${userId} joined room: ${userId}`);
      socket.join(userId);
      userSockets.set(userId, socket.id); // Store user socket mapping
    });
    
    socket.on("test-connection", ({ userId }) => {
      console.log(`📞 Test connection from user: ${userId}`);
      socket.emit("test-response", { message: "Socket connection working!", userId });
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // WebRTC signaling
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("end-call", (roomId) => {
      socket.to(roomId).emit("user-disconnected");
    });

    // Handle session start events
    socket.on("start-session", ({ roomId, connectionType }) => {
      socket.join(roomId);
      console.log(`User joined session room: ${roomId} for ${connectionType}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

export function getUserSocket(userId) {
  return userSockets.get(userId);
}

export function emitToUser(userId, event, data) {
  if (!io) return false;
  
  const socketId = userSockets.get(userId);
  if (socketId) {
    // Emit to specific socket
    io.to(socketId).emit(event, data);
    console.log(`📡 Emitted ${event} to user ${userId} via socket ${socketId}`);
    return true;
  } else {
    // Fallback: emit to room
    io.to(userId).emit(event, data);
    console.log(`📡 Emitted ${event} to user room ${userId}`);
    return false;
  }
}