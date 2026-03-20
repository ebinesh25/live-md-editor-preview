import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { socket } from '../utils/socket';
import { Plus, Users, Trash2, Copy, Check, Edit3 } from 'lucide-react';

const STORAGE_KEY = 'collab-editor-room';

function Home() {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState('');
  const [createdRoom, setCreatedRoom] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    setIsCreating(true);
    connectSocket();

    socket.emit('create-room');

    socket.once('room-created', (data) => {
      setCreatedRoom(data);
      setIsCreating(false);
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
    <div className="home-page min-h-screen flex flex-col items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #131313 0%, #0e0e0e 100%)'}}>
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
          Collab<span className="text-[#c1c1ff]">Mark</span>
        </h1>
        <p className="text-base text-[#c6c4d9] max-w-md mx-auto">
          Real-time collaborative markdown editor with ephemeral sessions. 
          Create, share, collaborate — and watch it disappear.
        </p>
      </div>

      {!createdRoom ? (
        <div className="w-full max-w-sm space-y-6">
          {/* Create Room Button */}
          <button 
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-base font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #4d49fc 0%, #8539e1 100%)',
              color: '#e5e3ff'
            }}
          >
            {isCreating ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} />
                Create New Room
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#464556]"></div>
            <span className="text-xs text-[#908fa2] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#464556]"></div>
          </div>

          {/* Join Room Form */}
          <form onSubmit={handleJoinRoom} className="space-y-3">
            <input
              type="text"
              placeholder="Enter room ID or URL"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{
                background: '#2a2a2a',
                border: '1px solid #464556',
                color: '#e5e2e1'
              }}
            />
            <button 
              type="submit" 
              disabled={!joinRoomId.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: joinRoomId.trim() ? '#4d49fc' : '#2a2a2a',
                color: joinRoomId.trim() ? '#e5e3ff' : '#908fa2',
                border: '1px solid #464556'
              }}
            >
              <Users size={16} />
              Join Room
            </button>
          </form>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#464556]">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{background: 'rgba(77, 73, 252, 0.15)'}}>
                <Edit3 size={18} className="text-[#c1c1ff]" />
              </div>
              <div className="text-xs text-[#908fa2]">No Signup</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{background: 'rgba(183, 209, 111, 0.15)'}}>
                <Users size={18} className="text-[#b7d16f]" />
              </div>
              <div className="text-xs text-[#908fa2]">Real-time</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center" style={{background: 'rgba(216, 185, 255, 0.15)'}}>
                <span className="material-symbols-outlined text-[#d8b9ff] text-lg">delete</span>
              </div>
              <div className="text-xs text-[#908fa2]">Ephemeral</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-6 rounded-2xl" style={{background: '#202020', border: '1px solid #464556'}}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Room Created!</h2>
              <p className="text-sm text-[#c6c4d9]">Share these details with your team</p>
            </div>
            <button 
              onClick={handleClearRoom}
              className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
              title="Clear room"
            >
              <Trash2 size={18} className="text-[#908fa2]" />
            </button>
          </div>

          {/* Edit Code */}
          <div className="mb-6">
            <label className="text-xs text-[#908fa2] uppercase tracking-wider">Edit Code (for editing)</label>
            <div className="mt-2 p-4 rounded-xl text-center" style={{background: '#2a2a2a'}}>
              <span className="text-3xl font-mono font-bold tracking-widest" style={{color: '#b7d16f', letterSpacing: '8px'}}>
                {createdRoom.editCode}
              </span>
            </div>
          </div>

          {/* Room ID */}
          <div className="mb-6">
            <label className="text-xs text-[#908fa2] uppercase tracking-wider">Room ID</label>
            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg" style={{background: '#131313'}}>
              <code className="flex-1 text-sm font-mono truncate text-[#c6c4d9]">
                {createdRoom.roomId}
              </code>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: '#4d49fc',
                color: '#e5e3ff'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Link Copied!' : 'Copy Share Link'}
            </button>

            <button 
              onClick={handleGoToRoom}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(183, 209, 111, 0.15)',
                color: '#b7d16f',
                border: '1px solid rgba(183, 209, 111, 0.3)'
              }}
            >
              <Edit3 size={16} />
              Open Room & Start Editing
            </button>
          </div>

          {/* Security Note */}
          <p className="mt-6 text-xs text-center text-[#908fa2]">
            This session will be deleted when all users leave
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
