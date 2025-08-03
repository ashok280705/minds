// lib/socket.js
import { Server } from "socket.io";

let io;

export function initIO(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("New Socket.IO connection:", socket.id);

      // Save socketId to DB if needed
      socket.on("register-user", ({ userId }) => {
        console.log("User registered:", userId);
        socket.join(userId); // use userId as room
      });

      socket.on("register-doctor", ({ doctorId }) => {
        console.log("Doctor registered:", doctorId);
        socket.join(doctorId);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });
  }
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}