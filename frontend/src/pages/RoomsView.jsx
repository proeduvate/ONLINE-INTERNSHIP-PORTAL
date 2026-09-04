import React, { useState } from 'react';
import MeetingRoom from './MeetingRoom';

export default function RoomsView({ user }) {
  const [activeChannel, setActiveChannel] = useState('main-meeting');

  const channels = [
    { id: 'main-meeting', name: '🔊 Main Meeting Room' },
    { id: 'breakout-frontend', name: '🔒 Breakout: Frontend Team' },
    { id: 'breakout-backend', name: '🔒 Breakout: Backend Team' },
    { id: 'breakout-ai', name: '🔒 Breakout: AI & ML Team' },
  ];

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#313338', minHeight: '100vh' }}>
      {/* Discord Left Channel Sidebar */}
      <div style={{ width: '240px', background: '#2b2d31', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ color: '#949ba4', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
          Voice Channels
        </h4>
        {channels.map(ch => (
          <div
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            style={{
              padding: '10px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '4px',
              fontWeight: '500',
              background: activeChannel === ch.id ? '#404249' : 'transparent',
              color: activeChannel === ch.id ? '#ffffff' : '#949ba4',
              transition: 'background 0.2s ease'
            }}
          >
            {ch.name}
          </div>
        ))}
      </div>

      {/* Main Stream Area */}
      <div style={{ flex: 1 }}>
        <MeetingRoom currentRoom={activeChannel} user={user} />
      </div>
    </div>
  );
}