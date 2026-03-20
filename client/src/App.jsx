import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Home from './components/Home';
import Editor from './components/Editor';
import { socket, connectSocket, disconnectSocket } from './utils/socket';

const STORAGE_KEY = 'collab-editor-room';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
}

function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [defaultViewMode, setDefaultViewMode] = useState('preview');

  useEffect(() => {
    connectSocket();

    const savedRoom = localStorage.getItem(STORAGE_KEY);
    const currentRoom = savedRoom ? JSON.parse(savedRoom) : null;
    const isRoomOwner = currentRoom?.roomId === roomId;

    if (isRoomOwner) {
      setIsEditing(true);
      setDefaultViewMode('edit');
    } else {
      setDefaultViewMode('preview');
    }

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-joined', (data) => {
      setContent(data.content);
      setConnectedUsers(data.userCount);
    });

    socket.on('content-updated', (data) => {
      setContent(data.content);
    });

    socket.on('user-count', (count) => {
      setConnectedUsers(count);
    });

    socket.on('error', (data) => {
      alert(data.message);
      navigate('/');
    });

    socket.on('session-ended', () => {
      navigate('/');
    });

    socket.on('edit-code-verified', (data) => {
      if (data.success) {
        setIsEditing(true);
        setShowEditModal(false);
      } else {
        alert('Invalid edit code');
      }
    });

    return () => {
      socket.emit('leave-room');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-joined');
      socket.off('content-updated');
      socket.off('user-count');
      socket.off('error');
      socket.off('session-ended');
      socket.off('edit-code-verified');
      disconnectSocket();
    };
  }, [roomId, navigate]);

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    socket.emit('content-change', { roomId, content: newContent });
  }, [roomId]);

  const handleEnableEditing = () => {
    setShowEditModal(true);
  };

  const handleVerifyEditCode = (code) => {
    socket.emit('verify-edit-code', { roomId, editCode: code });
  };

  const handleEndSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    socket.emit('end-session', { roomId });
    disconnectSocket();
    navigate('/');
  };

  return (
    <Editor
      content={content}
      onContentChange={handleContentChange}
      isEditing={isEditing}
      onEnableEditing={handleEnableEditing}
      connectedUsers={connectedUsers}
      isConnected={isConnected}
      showEditModal={showEditModal}
      onVerifyEditCode={handleVerifyEditCode}
      onCloseEditModal={() => setShowEditModal(false)}
      onEndSession={handleEndSession}
      roomId={roomId}
      defaultViewMode={defaultViewMode}
    />
  );
}

export default App;
