import React, { useState } from 'react';
import MeetingRoom from './MeetingRoom';

export default function RoomsView({ user }) {
  const [activeChannel, setActiveChannel] = useState('main-meeting');

  const channels = [
    { id: 'main-meeting', name: '?? Main Meeting Room' },
    { id: 'breakout-frontend', name: '????? Breakout: Frontend Team' },
    { id: 'breakout-backend', name: '????? Breakout: Backend Team' },
    { id: 'breakout-design', name: '?? Breakout: Design Team' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>ProEduvate Rooms</h2>
        </div>
        <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
          {channels.map(c => (
            <div 
              key={c.id} 
              onClick={() => setActiveChannel(c.id)}
              style={{
                padding: '12px 15px',
                margin: '4px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: activeChannel === c.id ? '#3b82f6' : 'transparent',
                fontWeight: activeChannel === c.id ? '600' : '400',
                transition: 'background 0.2s',
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid #334155', fontSize: '14px' }}>
          Logged in as <b>{user.name}</b>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* The crucial fix is adding key={activeChannel} so React remounts the component when switching rooms! */}
        <MeetingRoom key={activeChannel} currentRoom={activeChannel} user={user} />
      </div>
    </div>
  );
}
