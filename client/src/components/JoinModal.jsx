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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(189, 147, 249, 0.1)',
            border: '1px solid rgba(189, 147, 249, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={24} color="#bd93f9" />
          </div>
          <div>
            <h2 className="modal-title" style={{ marginBottom: '4px' }}>Enter Edit Code</h2>
            <p className="modal-subtitle" style={{ marginBottom: '0' }}>
              Enter the 6-character code to enable editing
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            value={editCode}
            onChange={handleChange}
            placeholder="XXXXXX"
            maxLength={6}
            autoFocus
          />
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <X size={16} />
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
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
