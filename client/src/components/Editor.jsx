import { useState, useEffect, useCallback, useRef } from 'react';
import Preview from './Preview';
import JoinModal from './JoinModal';
import { Users, Copy, Edit3, Eye, Wifi, WifiOff, LogOut } from 'lucide-react';

const STORAGE_KEY = 'collab-editor-room';

function Editor({
  content,
  onContentChange,
  isEditing,
  onEnableEditing,
  connectedUsers,
  isConnected,
  showEditModal,
  onVerifyEditCode,
  onCloseEditModal,
  onEndSession,
  roomId,
  defaultViewMode
}) {
  const [localContent, setLocalContent] = useState(content);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [viewMode, setViewMode] = useState(defaultViewMode || 'preview');
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedRoom = localStorage.getItem(STORAGE_KEY);
    if (savedRoom) {
      const { roomId: savedRoomId } = JSON.parse(savedRoom);
      setIsRoomOwner(savedRoomId === roomId);
    } else {
      setIsRoomOwner(false);
    }
  }, [roomId]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onContentChange(newContent);
    }, 100);

    setDebounceTimer(timer);
  }, [onContentChange, debounceTimer]);

  const handlePaste = useCallback((e) => {
    const clipboardData = e.clipboardData;
    
    const hasImage = Array.from(clipboardData.items).some(
      item => item.type.startsWith('image/')
    );

    if (hasImage) {
      e.preventDefault();
      alert('Image paste is not supported. Please use image URLs instead.');
      return;
    }
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="editor-header-left">
          <h1 className="editor-title">
            <span>Collab</span>
          </h1>
          <div className="status-badge">
            <Users size={16} />
            {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
          </div>
        </div>
        
        <div className="editor-status">
          <div className="editor-toolbar">
            <button
              onClick={() => setViewMode('edit')}
              className={viewMode === 'edit' ? 'toolbar-btn active' : 'toolbar-btn'}
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={viewMode === 'preview' ? 'toolbar-btn active' : 'toolbar-btn'}
            >
              <Eye size={16} />
              Preview
            </button>
            
            <div className="toolbar-divider" />
            
            <button className="copy-btn" onClick={handleCopyRoomId}>
              <Copy size={14} />
              {copiedRoomId ? 'Copied!' : 'Copy Room ID'}
            </button>
          </div>

          {!isEditing && (
            <button className="btn-accent" onClick={onEnableEditing}>
              <Edit3 size={16} />
              Enable Editing
            </button>
          )}

          <div className="status-badge">
            <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          </div>

          {isRoomOwner && (
            <button 
              onClick={() => onEndSession && onEndSession()}
              className="copy-btn"
              title="End Session"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="editor-content">
        <div className="editor-main">
          {viewMode === 'edit' ? (
            <textarea
              ref={textareaRef}
              className="markdown-textarea"
              value={localContent}
              onChange={handleChange}
              onPaste={handlePaste}
              disabled={!isEditing}
              placeholder={isEditing ? "Start typing your markdown here..." : "Enter edit code to enable editing"}
            />
          ) : (
            <Preview content={localContent} />
          )}
        </div>
      </main>

      {showEditModal && (
        <JoinModal
          onVerify={onVerifyEditCode}
          onClose={onCloseEditModal}
        />
      )}
    </div>
  );
}

export default Editor;
