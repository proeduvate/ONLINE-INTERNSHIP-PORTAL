import React, { useState } from 'react';
import { ChevronDown, Hash, Volume2, Mic, MicOff, Settings, Headphones } from 'lucide-react';
import { mockMentor, mockInterns } from './MockData';

export default function WorkspaceSidebar({ 
  rooms, 
  activeRoom, 
  setActiveRoom, 
  participants 
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const getRoomParticipants = (roomId) => {
    return participants.filter(p => p.room === rooms.find(r => r.id === roomId)?.name && p.online);
  };

  return (
    <div className="br-workspace-sidebar">
      
      <div className="br-workspace-content">
        <div className="br-section-title">LIVE MEETINGS</div>
        {rooms.filter(r => r.type === 'main').map(room => (
          <div key={room.id}>
            <div 
              className={`br-room-item ${activeRoom === room.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(room.id)}
            >
              <Volume2 size={18} /> {room.name}
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
              onClick={() => setActiveRoom(room.id)}
            >
              <Volume2 size={18} /> {room.name} {(room.isLocked || room.type === 'locked') && '🔒'}
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
          <div className="br-avatar-small" style={{ backgroundColor: '#5865f2' }}>An</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Ananya</span>
            <span style={{ fontSize: '11px', color: '#5c5e66' }}>Mentor</span>
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
  );
}
