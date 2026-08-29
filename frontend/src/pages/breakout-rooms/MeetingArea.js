import React, { useState } from 'react';
import { 
  Users, Maximize, Minimize, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Hand, MessageSquare, LogOut, LayoutGrid
} from 'lucide-react';

export default function MeetingArea({ 
  room, 
  participants, 
  rightPanelMode, 
  setRightPanelMode,
  onLeave,
  openManager
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getGridLayout = (count) => {
    if (count <= 1) return 'layout-1';
    if (count === 2) return 'layout-2';
    if (count === 3) return 'layout-3';
    if (count <= 4) return 'layout-4';
    if (count <= 6) return 'layout-6';
    return 'layout-many';
  };

  const layoutClass = getGridLayout(participants.length);

  return (
    <div className="br-main-area">
      <div className="br-main-header">
        <div className="br-header-left">
          <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {room?.name} 
            <span style={{ fontSize: '10px', backgroundColor: '#da373c', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>LIVE</span>
          </span>
        </div>
        <div className="br-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5c5e66' }}>
            <Users size={18} /> {participants.length}
          </div>
          <button className="br-btn br-btn-secondary" onClick={openManager}>
            <LayoutGrid size={18} /> Breakout Rooms
          </button>
          <button className="br-icon-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      <div className="br-video-grid-container">
        <div className={`br-video-grid ${layoutClass}`}>
          {participants.map((p) => (
            <div key={p.id} className={`br-video-tile ${p.micOn ? 'speaking' : ''}`}>
              {p.camOn ? (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#313338', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff' }}>[Video Feed]</span>
                </div>
              ) : (
                <div className="br-video-avatar">{p.avatar}</div>
              )}
              <div className="br-video-overlay">
                {p.micOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                {p.name}
              </div>
              <div className="br-video-controls">
                <button className="br-icon-btn" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}><MicOff size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="br-meeting-controls">
        <button 
          className={`br-control-btn ${!isMicOn ? 'danger' : ''}`} 
          onClick={() => setIsMicOn(!isMicOn)}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button 
          className={`br-control-btn ${!isVideoOn ? 'danger' : ''}`} 
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button 
          className={`br-control-btn ${isScreenSharing ? 'active' : ''}`} 
          onClick={() => setIsScreenSharing(!isScreenSharing)}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
        </button>

        <button 
          className={`br-control-btn ${isHandRaised ? 'active' : ''}`} 
          onClick={() => setIsHandRaised(!isHandRaised)}
        >
          <Hand size={20} color={isHandRaised ? '#fbb117' : 'currentColor'} />
        </button>
        <button className={`br-control-btn ${rightPanelMode === 'members' ? 'active' : ''}`} onClick={() => setRightPanelMode(rightPanelMode === 'members' ? 'closed' : 'members')}>
          <Users size={20} />
        </button>
        <button className={`br-control-btn ${rightPanelMode === 'chat' ? 'active' : ''}`} onClick={() => setRightPanelMode(rightPanelMode === 'chat' ? 'closed' : 'chat')}>
          <MessageSquare size={20} />
        </button>
        <div style={{ width: '1px', height: '32px', backgroundColor: '#d3d4d5', margin: '0 8px' }}></div>
        <button className="br-control-btn danger" style={{ borderRadius: '8px', width: 'auto', padding: '0 16px', gap: '8px' }} onClick={onLeave}>
          <LogOut size={20} /> Leave
        </button>
      </div>
    </div>
  );
}
