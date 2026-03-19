import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { socket } from '../utils/socket';
import { Plus, Link, Key, Copy, Share2, ArrowRight, Users, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'collab-editor-room';

function Home() {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [createdRoom, setCreatedRoom] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEditCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.editCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = () => {
    if (createdRoom) {
      const shareData = {
        title: 'Collab Editor',
        text: 'Join my collaborative markdown editing session!',
        url: `${window.location.origin}/room/${createdRoom.roomId}`
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {
          handleCopyLink();
        });
      } else {
        handleCopyLink();
      }
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
        <span>Collab</span> Editor
      </h1>
      <p className="home-subtitle">
        Real-time collaborative markdown editing with ephemeral sessions
      </p>

      <div className="home-card">
        {!createdRoom && (
          <div className="home-section">
            <h2 className="home-section-title">Create New Room</h2>
            <button 
              className="btn-primary" 
              onClick={handleCreateRoom}
              style={{ width: '100%' }}
            >
              <Plus size={18} />
              Create Room
            </button>
          </div>
        )}

        {createdRoom && (
          <div className="room-info">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#50fa7b', 
                  fontWeight: '600',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Your Room
                </div>
                <div style={{ fontSize: '13px', color: '#6272a4' }}>
                  Room ID: {createdRoom.roomId.substring(0, 8)}...
                </div>
              </div>
              <button 
                onClick={handleClearRoom}
                className="copy-btn"
                style={{ 
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
                title="Clear room and start fresh"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="room-info-label">
                <Link size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Share Link
              </div>
              <div className="room-info-value" style={{ fontSize: '13px', wordBreak: 'break-all' }}>
                {window.location.origin}/room/{createdRoom.roomId}
              </div>
              <button className="copy-btn" onClick={handleCopyLink} style={{ marginTop: '8px' }}>
                <Copy size={14} />
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div className="room-info-label">
                <Key size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Edit Code
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flexWrap: 'wrap',
                marginTop: '8px'
              }}>
                <span style={{ 
                  fontFamily: 'Fira Code, monospace', 
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#50fa7b',
                  letterSpacing: '6px'
                }}>
                  {createdRoom.editCode}
                </span>
                <button className="copy-btn" onClick={handleCopyEditCode}>
                  <Copy size={14} />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6272a4', 
                marginTop: '8px' 
              }}>
                Share this code to allow others to edit
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className="btn-accent" 
                onClick={handleShare}
                style={{ flex: 1, minWidth: '140px' }}
              >
                <Share2 size={18} />
                Share
              </button>
              <button 
                className="btn-primary" 
                onClick={handleGoToRoom}
                style={{ flex: 1, minWidth: '140px' }}
              >
                <ArrowRight size={18} />
                Go to Editor
              </button>
            </div>
          </div>
        )}

        <div className="home-section">
          <h2 className="home-section-title">Join Existing Room</h2>
          <form onSubmit={handleJoinRoom} className="home-input-group">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              <Users size={18} />
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
