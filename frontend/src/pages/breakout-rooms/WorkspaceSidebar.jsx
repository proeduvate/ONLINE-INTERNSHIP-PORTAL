import React, { useState } from 'react';
import { Volume2, Mic, MicOff, Settings, Headphones } from 'lucide-react';

export default function WorkspaceSidebar({ 
  rooms, 
  activeRoom, 
  setActiveRoom, 
  participants,
  isIntern = false,
  isOpen,
  onClose
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const getRoomParticipants = (roomId) => {
    return participants.filter(p => p.room === rooms.find(r => r.id === roomId)?.name && p.online);
  };

  const handleRoomClick = (roomId) => {
    // Interns cannot switch rooms themselves — mentor must assign them
    if (isIntern) return;
    setActiveRoom(roomId);
  };

  return (
    <>
      {isOpen && (
        <div className="br-modal-overlay" style={{ zIndex: 290 }} onClick={onClose} />
      )}
      <div className={`br-workspace-sidebar ${isOpen ? 'open' : ''}`}>
      
      <div className="br-workspace-content">
        <div className="br-section-title">LIVE MEETINGS</div>
        {rooms.filter(r => r.type === 'main').map(room => (
          <div key={room.id}>
            <div 
              className={`br-room-item ${activeRoom === room.id ? 'active' : ''}`}
              onClick={() => handleRoomClick(room.id)}
              style={{ cursor: isIntern ? 'default' : 'pointer' }}
            >
              <Volume2 size={18} /> {room.name}
              {isIntern && activeRoom === room.id && (
                <span style={{ marginLeft: 'auto', fontSize: '10px', backgroundColor: '#f59e0b', color: '#fff', padding: '1px 5px', borderRadius: '8px' }}>You</span>
              )}
            </div>
            {getRoomParticipants(room.id).map(p => (
              <div key={p.id} className="br-room-participant">
                <div className="br-avatar-small">{p.avatar}</div>
                {p.name}
              </div>
            ))}

          </div>
        ))}

        <div className="br-section-title">BREAKOUT ROOMS</div>
        {rooms.filter(r => r.type !== 'main').map(room => (
          <div key={room.id}>
            <div 
              className={`br-room-item ${activeRoom === room.id ? 'active' : ''}`}
              onClick={() => handleRoomClick(room.id)}
              style={{ cursor: isIntern ? 'default' : 'pointer', opacity: isIntern && activeRoom !== room.id ? 0.6 : 1 }}
            >
              <Volume2 size={18} /> {room.name} {(room.isLocked || room.type === 'locked') && '🔒'}
              {isIntern && activeRoom === room.id && (
                <span style={{ marginLeft: 'auto', fontSize: '10px', backgroundColor: '#10b981', color: '#fff', padding: '1px 5px', borderRadius: '8px' }}>You</span>
              )}
            </div>
            {getRoomParticipants(room.id).map(p => (
              <div key={p.id} className="br-room-participant">
                <div className="br-avatar-small">{p.avatar}</div>
                {p.name}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="br-user-profile">
        <div className="br-user-info">
          <div className="br-avatar-small" style={{ backgroundColor: isIntern ? '#10b981' : '#5865f2' }}>
            {isIntern ? 'Me' : 'An'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{isIntern ? 'You' : 'Ananya'}</span>
            <span style={{ fontSize: '11px', color: '#5c5e66' }}>{isIntern ? 'Intern' : 'Mentor'}</span>
          </div>
        </div>
        <div className="br-user-controls">
          <button className="br-icon-btn" onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? <Mic size={18} /> : <MicOff size={18} className="danger" />}
          </button>
          <button className="br-icon-btn" onClick={() => setIsDeafened(!isDeafened)}>
            {isDeafened ? <Headphones size={18} className="danger" /> : <Headphones size={18} />}
          </button>
          <button className="br-icon-btn"><Settings size={18} /></button>
        </div>
      </div>
    </div>
    </>
  );
}
