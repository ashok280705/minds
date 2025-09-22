const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

const userSockets = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ["https://claritycare2-0.onrender.com"]
        : "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('🔌 New Socket.IO:', socket.id);

    socket.on('register-doctor', ({ doctorId }) => {
      const doctorRoom = `doctor_${doctorId}`;
      console.log(`Doctor ${doctorId} joined room: ${doctorRoom}`);
      socket.join(doctorRoom);
    });

    socket.on('register-user', ({ userId }) => {
      const userRoom = `user_${userId}`;
      console.log(`👤 User ${userId} joined room: ${userRoom} with socket: ${socket.id}`);
      socket.join(userRoom);
      socket.join(userId.toString());
      userSockets.set(userRoom, socket.id);
      userSockets.set(userId.toString(), socket.id);
    });

    socket.on('join-room', (data) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      const userType = data.userType || 'unknown';
      socket.join(roomId);
      console.log(`${userType} joined room: ${roomId}`);
      
      socket.to(roomId).emit('user-connected', { userType, socketId: socket.id });
      
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets && roomSockets.size >= 2) {
        console.log(`Both users present in room ${roomId}`);
        io.to(roomId).emit('call-ready');
        socket.to(roomId).emit('start-call');
      }
    });

    socket.on('offer', ({ roomId, offer }) => {
      console.log(`📞 Relaying offer to room: ${roomId}`);
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', ({ roomId, answer }) => {
      console.log(`📞 Relaying answer to room: ${roomId}`);
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      console.log(`🧊 Relaying ICE candidate to room: ${roomId}`);
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('end-call', (roomId) => {
      console.log(`📞 Call ended in room: ${roomId}`);
      socket.to(roomId).emit('user-disconnected');
    });

    socket.on('disconnect', () => {
      console.log(`Socket ${socket.id} disconnected`);
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('user-disconnected');
        }
      });
      
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});