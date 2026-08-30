import React, { useState, useEffect, useRef } from 'react';
import MeetingRoom from './MeetingRoom';
import apiClient from '../services/apiClient';

export default function BreakoutRoomsApp({ user, meetingId = "default-meeting" }) {
  const [activeChannel, setActiveChannel] = useState('main-meeting');
  const [connectedUsers, setConnectedUsers] = useState({}); // To track who is in which room
  const ws = useRef(null);

  const channels = [
    { id: 'main-meeting', name: '🔊 Main Meeting Room' },
    { id: 'breakout-frontend', name: '🔒 Breakout: Frontend Team' },
    { id: 'breakout-backend', name: '🔒 Breakout: Backend Team' },
    { id: 'breakout-ai', name: '🔒 Breakout: AI & ML Team' },
  ];

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket for presence tracking
    const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
    const wsUri = baseUri.replace(/^http/, 'ws') + `/api/meetings/ws/${activeChannel}/${user.id}`;
    
    ws.current = new WebSocket(wsUri);

    ws.current.onopen = () => {
      console.log(`Connected to room: ${activeChannel}`);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'USER_DISCONNECTED') {
        console.log(`User ${data.client_id} disconnected.`);
      } else if (data.type === 'FORCE_RECALL') {
        alert("Host has recalled everyone to the main room.");
        handleRoomSwitch('main-meeting');
      } else if (data.type === 'BREAKOUT_EXPIRED') {
        alert(data.message);
        handleRoomSwitch('main-meeting');
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [activeChannel, user]);

  const handleRoomSwitch = async (roomId) => {
    if (!user) return;
    try {
      // Backend expects participant_id and target_room_id as query params
      await apiClient.post(`/api/meetings/switch-room?participant_id=${user.id}&target_room_id=${roomId}`);
      setActiveChannel(roomId);
    } catch (err) {
      console.error("Failed to switch room on backend:", err);
      setActiveChannel(roomId);
    }
  };

  const startBreakoutTimer = async () => {
    try {
      const duration = prompt("Enter breakout duration in minutes:", "5");
      if (!duration) return;
      
      await apiClient.post(`/api/meetings/${meetingId}/start-breakout-timer?duration_minutes=${duration}`);
      alert(`Timer started for ${duration} minutes!`);
    } catch (err) {
      console.error("Failed to start timer:", err);
      alert("Error starting breakout timer.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', background: '#313338', minHeight: '100vh' }}>
      {/* Discord Left Channel Sidebar */}
      <div style={{ width: '240px', background: '#2b2d31', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ color: '#949ba4', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
          Voice Channels
        </h4>
        
        <div style={{ flex: 1 }}>
          {channels.map(ch => (
            <div
              key={ch.id}
              onClick={() => handleRoomSwitch(ch.id)}
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

        {user?.role === "mentor" || user?.role === "admin" ? (
          <div style={{ marginTop: '20px', borderTop: '1px solid #404249', paddingTop: '16px' }}>
            <h4 style={{ color: '#949ba4', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
              Host Controls
            </h4>
            <button 
              onClick={startBreakoutTimer}
              style={{
                width: '100%',
                padding: '8px',
                background: '#5865f2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Start Timer
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Stream Area */}
      <div style={{ flex: 1 }}>
        <MeetingRoom currentRoom={activeChannel} user={user} />
      </div>
    </div>
  );
}