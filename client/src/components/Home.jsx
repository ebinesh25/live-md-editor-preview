import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { socket } from '../utils/socket';
import { Plus, Users, Trash2, Copy } from 'lucide-react';

const STORAGE_KEY = 'collab-editor-room';

function Home() {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [createdRoom, setCreatedRoom] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (createdRoom) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createdRoom));
    }
  }, [createdRoom]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { roomId } = JSON.parse(saved);
      navigate(`/room/${roomId}`);
    }
  }, []);

  const handleCreateRoom = () => {
    connectSocket();

    socket.emit('create-room');

    socket.once('room-created', (data) => {
      setCreatedRoom(data);
    });
  };

  const handleGoToRoom = () => {
    if (createdRoom) {
      navigate(`/room/${createdRoom.roomId}`);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId.trim()}`);
    }
  };

  const handleCopyLink = () => {
    if (createdRoom) {
      const link = `${window.location.origin}/room/${createdRoom.roomId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearRoom = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCreatedRoom(null);
    disconnectSocket();
  };

  return (
    <div className="home-page">
      <h1 className="home-title">
        <span>Collab</span>
      </h1>

      {!createdRoom ? (
        <div className="home-actions">
          <button className="btn-primary home-btn" onClick={handleCreateRoom}>
            <Plus size={20} />
            Create Room
          </button>
          
          <div className="home-divider">or</div>
          
          <form onSubmit={handleJoinRoom} className="home-join-form">
            <input
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="home-join-input"
            />
            <button type="submit" className="btn-secondary" disabled={!joinRoomId.trim()}>
              <Users size={18} />
              Join
            </button>
          </form>
        </div>
      ) : (
        <div className="home-card">
          <div className="room-info">
            <div className="room-info-header">
              <div>
                <div className="room-info-label">Room ID</div>
                <div className="room-info-value">
                  {createdRoom.roomId.substring(0, 8)}...
                </div>
              </div>
              <button 
                onClick={handleClearRoom}
                className="copy-btn"
                title="Clear room"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="room-info-row">
              <div className="room-info-label">Edit Code</div>
              <div className="edit-code">{createdRoom.editCode}</div>
            </div>

            <div className="room-info-row">
              <button className="copy-btn full-width" onClick={handleCopyLink}>
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <button className="btn-primary home-btn" onClick={handleGoToRoom}>
              <Users size={18} />
              Open Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
