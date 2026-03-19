import { useState, useEffect, useCallback } from 'react';
import Preview from './Preview';
import JoinModal from './JoinModal';
import { Edit3, Eye, Users, Lock, Wifi, WifiOff, LogOut } from 'lucide-react';

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

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="editor-header-left">
          <h1 className="editor-title">Collab Editor</h1>
          {isEditing ? (
            <span className="edit-mode-indicator">
              <Edit3 size={12} style={{ marginRight: '4px' }} />
              Edit Mode
            </span>
          ) : (
            <span className="read-only-indicator">
              <Eye size={12} style={{ marginRight: '4px' }} />
              Read Only
            </span>
          )}
        </div>
        
        <div className="editor-status">
          {!isEditing && (
            <button className="btn-accent" onClick={onEnableEditing}>
              <Lock size={16} />
              Enable Editing
            </button>
          )}
          <div className="status-badge">
            <span className={`status-dot ${isConnected ? 'connected' : ''}`}></span>
            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="status-badge">
            <Users size={16} />
            {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
          </div>
          {isRoomOwner && (
            <button 
              onClick={() => onEndSession && onEndSession()}
              className="copy-btn"
              style={{ 
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                backgroundColor: 'rgba(255, 85, 85, 0.1)',
                border: '1px solid rgba(255, 85, 85, 0.3)',
                color: '#ff5555'
              }}
              title="End Session"
            >
              <LogOut size={16} />
              End Session
            </button>
          )}
        </div>
      </header>

      <main className="editor-content">
        <div className="editor-section" style={{ flex: 1 }}>
          <div className="editor-section-header">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('edit')}
                className={viewMode === 'edit' ? 'icon-btn active' : 'icon-btn'}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'edit' ? 'rgba(189, 147, 249, 0.15)' : 'transparent',
                  color: viewMode === 'edit' ? '#bd93f9' : '#6272a4',
                  border: '1px solid',
                  borderColor: viewMode === 'edit' ? '#bd93f9' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={viewMode === 'preview' ? 'icon-btn active' : 'icon-btn'}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  backgroundColor: viewMode === 'preview' ? 'rgba(189, 147, 249, 0.15)' : 'transparent',
                  color: viewMode === 'preview' ? '#bd93f9' : '#6272a4',
                  border: '1px solid',
                  borderColor: viewMode === 'preview' ? '#bd93f9' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <textarea
              className="markdown-textarea"
              value={localContent}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? "Start typing your markdown here..." : "Enter edit code to enable editing"}
              style={{ minHeight: 'calc(100vh - 200px)' }}
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
