import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Maximize, Minimize, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Hand, MessageSquare, LogOut, LayoutGrid, CheckCircle2, ArrowLeft, Tv
} from 'lucide-react';

export default function MeetingArea({ 
  room, 
  participants, 
  rightPanelMode, 
  setRightPanelMode,
  onLeave,
  openManager,
  isIntern = false,
  onMinimize
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]);
  const [screenStream, setScreenStream] = useState(null);

  const screenStreamRef = useRef(null);
  const screenVideoRef = useRef(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isScreenSharing]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          screenStreamRef.current = stream;
          setScreenStream(stream);
          setIsScreenSharing(true);

          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
            screenStreamRef.current = null;
          };
        } else {
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.warn("Display media permission cancelled or unsupported, enabling stream view mode:", err);
        setIsScreenSharing(true);
      }
    }
  };

  const triggerEmojiReaction = (emojiChar) => {
    const newId = Date.now() + Math.random();
    const leftPos = 25 + Math.random() * 50;
    setActiveReactions(prev => [...prev, { id: newId, emoji: emojiChar, left: leftPos }]);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== newId));
    }, 2200);
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
    <div className="br-main-area" style={{ position: 'relative' }}>
      <div className="br-main-header">
        <div className="br-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onMinimize && (
            <button 
              className="br-btn br-btn-secondary" 
              onClick={onMinimize}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Minimize meeting call & return to portal dashboard"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          )}
          <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {room?.name} 
            <span style={{ fontSize: '10px', backgroundColor: '#da373c', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>LIVE</span>
          </span>

          {isIntern && room?.type !== 'main' && (
            <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #10b981', display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Assigned to {room?.name}
            </span>
          )}
        </div>
        <div className="br-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5c5e66' }}>
            <Users size={18} /> {participants.length}
          </div>
          {!isIntern && (
            <button className="br-btn br-btn-secondary" onClick={openManager}>
              <LayoutGrid size={18} /> Breakout Rooms
            </button>
          )}
          <button className="br-icon-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Hand Raised Banner */}
      {isHandRaised && (
        <div style={{ backgroundColor: '#fef3c7', borderBottom: '1px solid #f59e0b', color: '#92400e', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 12 }}>
          <span>✋ Hand Raised - The host has been notified</span>
          <button onClick={() => setIsHandRaised(false)} style={{ background: '#92400e', color: '#ffffff', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}>Lower Hand</button>
        </div>
      )}

      <div className="br-video-grid-container" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Animated Floating Emojis */}
        {activeReactions.map(r => (
          <div 
            key={r.id} 
            className="floating-emoji"
            style={{ left: `${r.left}%`, bottom: '20px' }}
          >
            {r.emoji}
          </div>
        ))}

        {/* DISCORD STYLE SCREEN SHARING STAGE */}
        {isScreenSharing ? (
          <div className="br-discord-stage-container">
            {/* Top Participant Camera Strip (Discord Theater Strip) */}
            <div className="br-discord-participant-strip">
              {participants.map((p, idx) => {
                const pMic = idx === 0 ? isMicOn : p.micOn;
                const pCam = idx === 0 ? isVideoOn : p.camOn;
                return (
                  <div key={p.id} className={`br-discord-participant-tile ${pMic ? 'speaking' : ''}`}>
                    {pCam ? (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                        <Video size={20} />
                      </div>
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#5865f2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                        {p.avatar || p.name[0]}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '2px', left: '4px', right: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.6)', padding: '1px 4px', borderRadius: '4px', fontSize: '9px', color: '#ffffff' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      {pMic ? <Mic size={10} color="#23a559" /> : <MicOff size={10} color="#da373c" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Stage Screen Share Container */}
            <div className="br-discord-stage-view">
              {/* Discord Top Stage Header */}
              <div className="br-discord-stage-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="br-discord-live-badge">
                    <Tv size={14} /> LIVE
                  </div>
                  <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700 }}>
                    Screen Share - {participants[0]?.name || 'You'}
                  </span>
                  <span style={{ backgroundColor: '#2b2d31', color: '#b5bac1', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    1080p 60FPS
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={handleToggleScreenShare} 
                    style={{ backgroundColor: '#da373c', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MonitorOff size={14} /> Stop Sharing
                  </button>
                  <button 
                    onClick={toggleFullscreen}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </button>
                </div>
              </div>

              {/* Screen Stream Video Feed or Simulated IDE Stage */}
              {screenStream ? (
                <video 
                  ref={screenVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000000' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#0e1117', display: 'flex', flexDirection: 'column', fontFamily: 'Consolas, monospace', padding: '48px 24px 24px 24px', boxSizing: 'border-box', overflow: 'hidden' }}>
                  {/* Simulated Code Editor Screen Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#161b22', padding: '8px 16px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
                    </div>
                    <span style={{ color: '#8b949e', fontSize: '12px' }}>App.jsx — VS Code Live Share Stream</span>
                  </div>

                  {/* Simulated Code Lines */}
                  <div style={{ flex: 1, backgroundColor: '#0d1117', padding: '16px', fontSize: '13px', lineHeight: '1.6', color: '#c9d1d9', overflowY: 'auto' }}>
                    <p style={{ margin: 0 }}><span style={{ color: '#ff7b72' }}>import</span> React, &#123; useState &#125; <span style={{ color: '#ff7b72' }}>from</span> <span style={{ color: '#a5d6ff' }}>'react'</span>;</p>
                    <p style={{ margin: 0 }}><span style={{ color: '#ff7b72' }}>import</span> &#123; Video, Mic &#125; <span style={{ color: '#ff7b72' }}>from</span> <span style={{ color: '#a5d6ff' }}>'lucide-react'</span>;</p>
                    <p style={{ margin: 0 }}></p>
                    <p style={{ margin: 0 }}><span style={{ color: '#d2a8ff' }}>export default function</span> <span style={{ color: '#ffa657' }}>LiveStreamComponent</span>() &#123;</p>
                    <p style={{ margin: 0, paddingLeft: '20px' }}><span style={{ color: '#79c0ff' }}>const</span> [stream, setStream] = <span style={{ color: '#d2a8ff' }}>useState</span>(<span style={{ color: '#79c0ff' }}>true</span>);</p>
                    <p style={{ margin: 0, paddingLeft: '20px' }}></p>
                    <p style={{ margin: 0, paddingLeft: '20px' }}><span style={{ color: '#ff7b72' }}>return</span> (</p>
                    <p style={{ margin: 0, paddingLeft: '40px' }}>&lt;<span style={{ color: '#7ee787' }}>div</span> <span style={{ color: '#79c0ff' }}>className</span>=<span style={{ color: '#a5d6ff' }}>"discord-live-stage"</span>&gt;</p>
                    <p style={{ margin: 0, paddingLeft: '60px' }}>&lt;<span style={{ color: '#7ee787' }}>h1</span>&gt;🚀 Discord Screen Share Active&lt;/<span style={{ color: '#7ee787' }}>h1</span>&gt;</p>
                    <p style={{ margin: 0, paddingLeft: '40px' }}>&lt;/<span style={{ color: '#7ee787' }}>div</span>&gt;</p>
                    <p style={{ margin: 0, paddingLeft: '20px' }}>);</p>
                    <p style={{ margin: 0 }}>&#125;</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD PARTICIPANTS GRID */
          participants.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              <Users size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#64748b' }}>No participants in this room</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>Interns will appear here when they join or are assigned to this breakout room.</p>
            </div>
          ) : (
            <div className={`br-video-grid ${layoutClass}`}>
              {participants.map((p, idx) => {
                const pMic = idx === 0 ? isMicOn : p.micOn;
                const pCam = idx === 0 ? isVideoOn : p.camOn;
                return (
                  <div key={p.id} className={`br-video-tile ${pMic ? 'speaking' : ''}`}>
                    {pCam ? (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', gap: '8px' }}>
                        <Video size={36} color="#60a5fa" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name} (Live Video)</span>
                      </div>
                    ) : (
                      <div className="br-video-avatar">{p.avatar}</div>
                    )}

                    {idx === 0 && isHandRaised && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#f59e0b', color: '#ffffff', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        ✋ Hand Raised
                      </div>
                    )}

                    <div className="br-video-overlay">
                      {pMic ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                      {p.name} {idx === 0 ? '(You)' : ''}
                    </div>
                    <div className="br-video-controls">
                      <button className="br-icon-btn" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }} onClick={() => idx === 0 && setIsMicOn(!isMicOn)}>
                        {pMic ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <div className="br-meeting-controls">
        {/* Mute/Unmute Mic Button (Red when muted) */}
        <button 
          className={`br-control-btn ${!isMicOn ? 'danger' : ''}`} 
          onClick={() => setIsMicOn(!isMicOn)}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        {/* Toggle Camera Button */}
        <button 
          className={`br-control-btn ${!isVideoOn ? '' : 'active'}`} 
          onClick={() => setIsVideoOn(!isVideoOn)}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Share Screen Button (Discord Style) */}
        <button 
          className={`br-control-btn ${isScreenSharing ? 'active' : ''}`} 
          onClick={handleToggleScreenShare}
          title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
          style={{ backgroundColor: isScreenSharing ? '#5865f2' : undefined, color: isScreenSharing ? '#ffffff' : undefined }}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
        </button>

        {/* Raise Hand Button */}
        <button 
          className={`br-control-btn ${isHandRaised ? 'active' : ''}`} 
          onClick={() => setIsHandRaised(!isHandRaised)}
          title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand size={20} color={isHandRaised ? '#fbb117' : 'currentColor'} />
        </button>

        {/* Members Panel Button */}
        <button 
          className={`br-control-btn ${rightPanelMode === 'members' ? 'active' : ''}`} 
          onClick={() => setRightPanelMode(rightPanelMode === 'members' ? 'closed' : 'members')}
          title="Toggle Participants Panel"
          style={{ backgroundColor: rightPanelMode === 'members' ? '#5865f2' : undefined, color: rightPanelMode === 'members' ? '#ffffff' : undefined }}
        >
          <Users size={20} />
        </button>

        {/* Chat Panel Button */}
        <button 
          className={`br-control-btn ${rightPanelMode === 'chat' ? 'active' : ''}`} 
          onClick={() => setRightPanelMode(rightPanelMode === 'chat' ? 'closed' : 'chat')}
          title="Toggle Chat Panel"
        >
          <MessageSquare size={20} />
        </button>

        {/* 2 Interactive Emoji Reaction Buttons */}
        <button 
          className="br-control-btn"
          style={{ fontSize: '20px', cursor: 'pointer' }}
          onClick={() => triggerEmojiReaction('👏')}
          title="Send Clap Reaction"
        >
          👏
        </button>

        <button 
          className="br-control-btn"
          style={{ fontSize: '20px', cursor: 'pointer' }}
          onClick={() => triggerEmojiReaction('👍')}
          title="Send Thumbs Up Reaction"
        >
          👍
        </button>

        <div style={{ width: '1px', height: '32px', backgroundColor: '#d3d4d5', margin: '0 8px' }}></div>

        {/* Leave Meeting Button */}
        <button className="br-control-btn danger" style={{ borderRadius: '8px', width: 'auto', padding: '0 16px', gap: '8px' }} onClick={onLeave}>
          <LogOut size={20} /> Leave
        </button>
      </div>
    </div>
  );
}
