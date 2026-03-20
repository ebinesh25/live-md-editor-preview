# Collaborative Markdown Editor - Technical Specification

## Project Overview
A real-time collaborative markdown editor with ephemeral sessions where users can create rooms, share links for viewing, and use edit codes for editing capabilities.

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite, socket.io-client, react-markdown
- **Backend**: Node.js, Express, Socket.IO
- **Storage**: In-memory (Map structure)
- **Deployment**: Docker & Docker Compose

### Project Structure
```
share-collab-dissaper/
├── server/
│   ├── package.json
│   ├── index.js              # Express + Socket.IO server
│   └── Dockerfile
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Editor.jsx      # Markdown editor
│       │   ├── Preview.jsx     # Markdown preview
│       │   ├── JoinModal.jsx   # Edit code entry
│       │   └── Home.jsx        # Room creation
│       └── utils/
│           └── socket.js        # Socket.IO client
├── docker-compose.yml
└── README.md
```

## Backend Specification

### Data Structures

```javascript
// In-memory storage
rooms = Map<roomId, {
  id: string,
  editCode: string,           // 6-character alphanumeric
  content: string,            // Markdown content
  users: Set<socketId>,       // Connected users
  createdAt: timestamp
}>
```

### API Endpoints

#### REST Endpoints
- `GET /health` - Health check endpoint

#### Socket.IO Events

**Client → Server:**
- `create-room` → Creates new room, returns `{ roomId, editCode }`
- `join-room` → Join a room with roomId
- `content-change` → Broadcast content updates to all users
- `leave-room` → User leaves the room

**Server → Client:**
- `room-created` → Confirms room creation with credentials
- `room-joined` → Confirms joining, sends current content and edit permission
- `content-updated` → Receives updated content
- `user-count` → Number of users in room
- `error` → Error messages

### Room Lifecycle
1. **Creation**: Generate unique roomId (UUID) + editCode (6 random chars)
2. **Active**: Store content in memory, track connected users
3. **Cleanup**: When `users.size === 0`, delete room from memory after 30s grace period

## Frontend Specification

### Pages/Views

#### Home Page (`/`)
- **Create Room Button**: Creates new room
- **Join Room Input**: Enter roomId to join
- **Display**: Shows created roomId + editCode with copy-to-clipboard

#### Editor Page (`/room/:roomId`)
- **Editor Area**: Textarea for markdown editing
- **Preview Area**: Live markdown preview below editor
- **Status Bar**: Shows connection status, user count, edit mode status
- **Edit Code Modal**: Prompts for editCode if attempting to edit in read-only mode

### Component Details

#### Editor Component
- **Props**: `content`, `onChange`, `disabled`
- **Behavior**: Emits `content-change` on every keystroke (debounced 100ms)
- **Styling**: Monospace font, syntax highlighting for markdown

#### Preview Component
- **Props**: `content`
- **Dependencies**: react-markdown with remark-gfm (GitHub Flavored Markdown)
- **Styling**: Clean markdown styling, code blocks with background

#### JoinModal Component
- **Purpose**: Enter edit code to enable editing
- **Fields**: Edit code input (6 characters)
- **Actions**: Submit, Cancel
- **Error Handling**: Invalid code feedback

#### Home Component
- **Create Room Section**: Button to generate new room
- **Join Room Section**: Input + button to join existing room
- **Room Info Display**: Shows after creation with copy functionality

### State Management

```javascript
// App-level state
{
  view: 'home' | 'editor',
  roomId: string | null,
  editCode: string | null,
  isEditing: boolean,
  content: string,
  connectedUsers: number,
  socket: Socket
}
```

### URL Structure
- `/` - Home page (create/join room)
- `/room/:roomId` - Editor page for specific room

## UI/UX Specification

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #64748b (Slate)
- **Accent**: #10b981 (Green for edit mode)
- **Background**: #0f172a (Dark slate)
- **Surface**: #1e293b (Lighter slate)
- **Text Primary**: #f8fafc (Near white)
- **Text Secondary**: #94a3b8 (Muted)
- **Error**: #ef4444 (Red)
- **Border**: #334155 (Dark border)

### Typography
- **Font Family**: 'Inter', system-ui, sans-serif
- **Monospace**: 'Fira Code', 'Consolas', monospace (for editor)
- **Heading**: 24px bold
- **Body**: 16px regular
- **Code**: 14px monospace

### Layout
- **Container**: Max-width 1200px, centered
- **Editor**: Full width, min-height 300px
- **Preview**: Full width, min-height 300px, scrollable
- **Spacing**: 16px padding, 8px gaps

### Responsive Design
- **Desktop**: Side-by-side editor and preview (future enhancement)
- **Mobile/Tablet**: Stacked layout (editor above preview)

## Socket.IO Implementation

### Connection Flow
1. Client connects to Socket.IO server
2. Client emits `join-room` with roomId
3. Server adds user to room, broadcasts `user-count`
4. Server emits `room-joined` with current content
5. Client receives content, displays in editor

### Sync Protocol
- **Debouncing**: 100ms debounce on content changes
- **Optimistic Updates**: Update local state immediately
- **Conflict Resolution**: Last-write-wins (simple approach)

### Reconnection Handling
- Auto-reconnect with exponential backoff
- Restore state on reconnection
- Show connection status indicator

## Docker Configuration

### Server Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Client Dockerfile
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
```

### Nginx Configuration (client)
```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location /socket.io/ {
  proxy_pass http://server:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

## Security Considerations
- Edit codes are simple 6-character alphanumeric (low security, ephemeral use case)
- No authentication required (anonymous collaboration)
- Room content is ephemeral and deleted when empty
- Rate limiting on content changes (optional enhancement)

## Performance Considerations
- In-memory storage for low latency
- Debounced updates to reduce network traffic
- No persistence layer (ephemeral by design)
- Lightweight Socket.IO protocol

## Future Enhancements (Not in Initial Scope)
- User cursors/presence indicators
- Syntax highlighting in editor
- User avatars/names
- Export to PDF/HTML
- Persistent rooms (optional toggle)
- Room password protection
