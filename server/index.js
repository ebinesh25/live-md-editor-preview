import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

const GRACE_PERIOD = 30000;

function generateEditCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function scheduleRoomCleanup(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.cleanupTimeout) {
    clearTimeout(room.cleanupTimeout);
  }

  room.cleanupTimeout = setTimeout(() => {
    const currentRoom = rooms.get(roomId);
    if (currentRoom && currentRoom.users.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted after grace period`);
    }
  }, GRACE_PERIOD);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  let currentRoomId = null;

  socket.on('create-room', () => {
    const roomId = uuidv4();
    const editCode = generateEditCode();

    const room = {
      id: roomId,
      editCode: editCode,
      content: '# Welcome to the Collaborative Editor\n\nStart typing to collaborate!\n',
      users: new Set([socket.id]),
      createdAt: Date.now(),
      cleanupTimeout: null
    };

    rooms.set(roomId, room);
    currentRoomId = roomId;
    socket.join(roomId);

    console.log(`Room created: ${roomId}, edit code: ${editCode}`);

    socket.emit('room-created', {
      roomId,
      editCode,
      content: room.content
    });
  });

  socket.on('join-room', ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.cleanupTimeout) {
      clearTimeout(room.cleanupTimeout);
      room.cleanupTimeout = null;
    }

    room.users.add(socket.id);
    currentRoomId = roomId;
    socket.join(roomId);

    io.to(roomId).emit('user-count', room.users.size);
    socket.emit('room-joined', {
      content: room.content,
      userCount: room.users.size
    });

    console.log(`User ${socket.id} joined room ${roomId}, total users: ${room.users.size}`);
  });

  socket.on('content-change', ({ roomId, content }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    room.content = content;
    socket.to(roomId).emit('content-updated', { content });
  });

  socket.on('verify-edit-code', ({ roomId, editCode }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.editCode === editCode.toUpperCase()) {
      socket.emit('edit-code-verified', { success: true });
    } else {
      socket.emit('edit-code-verified', { success: false });
    }
  });

  socket.on('leave-room', () => {
    if (currentRoomId) {
      handleDisconnect(currentRoomId, socket.id);
      currentRoomId = null;
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (currentRoomId) {
      handleDisconnect(currentRoomId, socket.id);
    }
  });

  function handleDisconnect(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.users.delete(socketId);
    io.to(roomId).emit('user-count', room.users.size);

    console.log(`User ${socketId} left room ${roomId}, remaining users: ${room.users.size}`);

    if (room.users.size === 0) {
      scheduleRoomCleanup(roomId);
    }
  }
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
