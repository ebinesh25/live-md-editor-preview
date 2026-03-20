import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Preview from './Preview';
import JoinModal from './JoinModal';
import { Users, Copy, Edit3, Eye, LogOut, Check, ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'collab-editor-room';

const ADJECTIVES = ['Swift', 'Silent', 'Nimble', 'Shadow', 'Bright', 'Quick', 'Calm', 'Bold'];
const ANIMALS = ['Fox', 'Owl', 'Deer', 'Lynx', 'Wolf', 'Bear', 'Hawk', 'Fox'];

function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

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
  const [viewMode, setViewMode] = useState(defaultViewMode || 'edit');
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [editCode, setEditCode] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [copiedEditCode, setCopiedEditCode] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const textareaRef = useRef(null);
  const [username] = useState(() => localStorage.getItem('collab-username') || (() => {
    const name = generateUsername();
    localStorage.setItem('collab-username', name);
    return name;
  })());

  const wordCount = useMemo(() => {
    if (!localContent.trim()) return 0;
    return localContent.trim().split(/\s+/).filter(Boolean).length;
  }, [localContent]);

  const charCount = useMemo(() => {
    return localContent.length;
  }, [localContent]);

  const lineCount = useMemo(() => {
    if (!localContent) return 1;
    return localContent.split('\n').length;
  }, [localContent]);

  const roomDisplayId = useMemo(() => {
    if (!roomId) return '';
    const short = roomId.slice(0, 8).toUpperCase();
    return `MARK-${short}`;
  }, [roomId]);

  useEffect(() => {
    const savedRoom = localStorage.getItem(STORAGE_KEY);
    if (savedRoom) {
      const { roomId: savedRoomId, editCode: savedEditCode } = JSON.parse(savedRoom);
      setIsRoomOwner(savedRoomId === roomId);
      setEditCode(savedEditCode || '');
    } else {
      setIsRoomOwner(false);
      setEditCode('');
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
      return;
    }
  }, []);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const handleCopyEditCode = () => {
    if (editCode) {
      navigator.clipboard.writeText(editCode);
      setCopiedEditCode(true);
      setTimeout(() => setCopiedEditCode(false), 2000);
    }
  };

  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313] flex justify-between items-center px-4 md:px-6 h-14 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg md:text-xl font-bold text-white tracking-tighter">CollabMark</a>
          <nav className="hidden md:flex gap-6 items-center">
            <button 
              onClick={() => setViewMode('edit')}
              className={`font-['Inter'] tracking-tight font-medium text-sm transition-colors pb-1 ${
                viewMode === 'edit' 
                  ? 'text-[#c1c1ff] border-b-2 border-[#4d49fc]' 
                  : 'text-[#a1a1a1] hover:text-white'
              }`}
            >
              Editor
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`font-['Inter'] tracking-tight font-medium text-sm transition-colors pb-1 ${
                viewMode === 'preview' 
                  ? 'text-[#c1c1ff] border-b-2 border-[#4d49fc]' 
                  : 'text-[#a1a1a1] hover:text-white'
              }`}
            >
              Preview
            </button>
          </nav>
        </div>
        
        {/* Mobile Editor/Preview Toggle */}
        <div className="flex md:hidden gap-2">
          <button 
            onClick={() => setViewMode('edit')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'edit' 
                ? 'bg-[#4d49fc] text-white' 
                : 'bg-surface-container text-[#a1a1a1]'
            }`}
          >
            Edit
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'preview' 
                ? 'bg-[#4d49fc] text-white' 
                : 'bg-surface-container text-[#a1a1a1]'
            }`}
          >
            Preview
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Connection Status - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-error'}`}></span>
            <span className="text-xs font-medium text-on-surface-variant">
              {connectedUsers} active
            </span>
          </div>
          
          {/* Mobile Info Toggle */}
          <button 
            onClick={() => setShowMobileInfo(!showMobileInfo)}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-md bg-surface-container text-[#a1a1a1] text-xs"
          >
            <span className="text-[10px]">{wordCount}W {charCount}C</span>
            <ChevronDown size={12} className={`transition-transform ${showMobileInfo ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {!isEditing && (
              <button 
                onClick={onEnableEditing}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary-container text-on-primary-container text-sm font-medium hover:brightness-110 active:scale-95 transition-all"
              >
                <Edit3 size={16} />
                <span>Enable Editing</span>
              </button>
            )}
            
            <button 
              onClick={handleCopyRoomId}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary-container text-on-primary-container text-sm font-medium hover:brightness-110 active:scale-95 transition-all"
            >
              {copiedRoomId ? <Check size={16} /> : <Copy size={16} />}
              <span>Share</span>
            </button>
            
            {isRoomOwner && (
              <button 
                onClick={() => onEndSession && onEndSession()}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md border border-error-container/30 text-error hover:bg-error-container/10 transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                <span>End Session</span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-1">
            <button 
              onClick={handleCopyRoomId}
              className="p-2 rounded-md bg-primary-container text-on-primary-container"
            >
              {copiedRoomId ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {isRoomOwner && (
              <button 
                onClick={() => onEndSession && onEndSession()}
                className="p-2 rounded-md border border-error-container/30 text-error"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Info Panel */}
      <div className={`fixed top-14 left-0 right-0 z-40 bg-[#1b1b1c] border-b border-outline-variant/10 transition-all duration-300 md:hidden ${
        showMobileInfo ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="p-4 space-y-4">
          {isRoomOwner && editCode && (
            <div className="space-y-1">
              <label className="text-[10px] text-secondary uppercase">Edit Code</label>
              <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-md">
                <span className="text-lg font-mono font-bold flex-grow tracking-widest" style={{color: '#b7d16f'}}>{editCode}</span>
                <button 
                  onClick={handleCopyEditCode}
                  className="text-primary hover:text-white transition-colors p-1"
                >
                  {copiedEditCode ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant/60 uppercase">Room</label>
            <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-md">
              <span className="text-xs font-mono flex-grow truncate">{roomDisplayId}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2 bg-surface-container-low rounded-md text-center">
              <div className="text-[10px] text-on-surface-variant/60 uppercase">Words</div>
              <div className="text-sm font-bold font-mono">{wordCount}</div>
            </div>
            <div className="p-2 bg-surface-container-low rounded-md text-center">
              <div className="text-[10px] text-on-surface-variant/60 uppercase">Chars</div>
              <div className="text-sm font-bold font-mono">{charCount}</div>
            </div>
            <div className="p-2 bg-surface-container-low rounded-md text-center">
              <div className="text-[10px] text-on-surface-variant/60 uppercase">Lines</div>
              <div className="text-sm font-bold font-mono">{lineCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-14 p-4 md:p-6 flex flex-col">
        {/* Editor/Preview Section */}
        <div className="flex-grow flex flex-col gap-4 md:gap-6">
          {/* Ephemeral Alert - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 p-4 bg-tertiary-container/10 border border-tertiary-container/20 rounded-xl">
            <span className="material-symbols-outlined text-tertiary">info</span>
            <p className="text-sm text-tertiary-fixed-dim font-medium">
              Ephemeral Session: All data is permanently deleted once the last person leaves.
            </p>
          </div>

          {/* Main Editor/Preview Container */}
          <div 
            className="flex-grow flex flex-col bg-surface-container rounded-xl overflow-hidden shadow-2xl shadow-black/40"
            style={{minHeight: 'calc(100vh - 7rem)'}}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-surface-container-high border-b border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-outline uppercase tracking-widest">untitled_session.md</span>
                {isEditing && (
                  <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-medium rounded">Editing</span>
                )}
              </div>
              <div className="hidden md:flex items-center gap-4">
                <span className="text-[10px] font-mono text-on-surface-variant/50">UTF-8</span>
                <span className="text-[10px] font-mono text-on-surface-variant/50">Markdown</span>
              </div>
            </div>

            {/* Editor/Preview Area */}
            <div className="flex flex-grow overflow-auto scrollbar-thin">
              {viewMode === 'edit' ? (
                <div className="flex flex-grow">
                  {/* Line Numbers - Hidden on mobile */}
                  <div className="hidden md:block w-12 py-6 bg-surface-container-low text-right pr-4 select-none border-r border-outline-variant/10">
                    <div className="font-mono text-xs text-outline/30 leading-relaxed">
                      {lineNumbers.map(num => (
                        <div key={num}>{num}</div>
                      ))}
                    </div>
                  </div>
                  {/* Editor Text */}
                  <textarea
                    ref={textareaRef}
                    className="flex-grow p-4 md:p-6 font-mono text-sm leading-relaxed outline-none whitespace-pre-wrap bg-transparent text-on-surface resize-none"
                    value={localContent}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Start typing your markdown here..." : "Enter edit code to enable editing"}
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="flex-grow p-4 md:p-6 overflow-auto">
                  <Preview content={localContent} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Code Modal */}
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
