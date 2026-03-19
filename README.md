# Collaborative Markdown Editor

A real-time collaborative markdown editor with ephemeral sessions. Create rooms, share links for viewing, and use edit codes for editing capabilities.

## Features

- **Room Creation**: Generate unique rooms with shareable links
- **Edit Codes**: 6-character codes to enable editing mode
- **Real-time Collaboration**: See changes instantly across all connected users
- **Live Preview**: Markdown preview updates as you type
- **Ephemeral Sessions**: Content is deleted when all users leave
- **Read-only Mode**: View-only access by default

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Run with Docker Compose

```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001

### Health Check

```bash
curl http://localhost:3001/health
```

## Development Setup

### Prerequisites
- Node.js 20+
- npm

### Backend

```bash
cd server
npm install
npm start
```

Server runs on http://localhost:3001

### Frontend

```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:5173

## Usage

### Create a Room
1. Click "Create Room" on the home page
2. You'll be redirected to a new room with a unique URL
3. Copy the share link or edit code to share with others

### Join a Room
1. Enter the room ID on the home page, or
2. Use a direct room URL (e.g., http://localhost/room/abc123...)

### Enable Editing
1. Click "Enable Editing" button
2. Enter the 6-character edit code
3. Start collaborating!

## Architecture

- **Frontend**: React 18 + Vite, react-markdown, socket.io-client
- **Backend**: Node.js, Express, Socket.IO
- **Storage**: In-memory (ephemeral)
- **Proxy**: Nginx for production

## Socket.IO Events

### Client → Server
- `create-room`: Create new room
- `join-room`: Join existing room
- `content-change`: Send content updates
- `verify-edit-code`: Verify edit code
- `leave-room`: Leave room

### Server → Client
- `room-created`: Room created successfully
- `room-joined`: Joined room successfully
- `content-updated`: Content updated by another user
- `user-count`: Number of users in room
- `edit-code-verified`: Edit code verification result
- `error`: Error messages

## License

MIT
