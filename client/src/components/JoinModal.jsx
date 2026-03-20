import { useState } from 'react';
import { Key, X } from 'lucide-react';

function JoinModal({ onVerify, onClose }) {
  const [editCode, setEditCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editCode.length === 6) {
      onVerify(editCode);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setEditCode(value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <Key />
        </div>
        
        <h2 className="modal-title">Enter Edit Code</h2>
        <p className="modal-subtitle">
          Enter the 6-character code shared by the room owner to enable editing
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            value={editCode}
            onChange={handleChange}
            placeholder="------"
            maxLength={6}
            autoFocus
          />
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-btn-secondary"
              onClick={onClose}
            >
              <X size={16} />
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-btn-primary"
              disabled={editCode.length !== 6}
            >
              <Key size={16} />
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JoinModal;
