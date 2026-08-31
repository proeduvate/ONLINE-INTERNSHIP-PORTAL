import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Maximize, Minimize, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Hand, MessageSquare, LogOut, LayoutGrid
} from 'lucide-react';

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ]
};

export default function MeetingArea({ 
  room, 
  participants, // from props (mocked sidebar participants)
  rightPanelMode, 
  setRightPanelMode,
  onLeave,
  openManager,
  isIntern = false,
  onMinimize,
  toggleLeftPanel
}) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // User auth info (fallback if not in local storage)
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== "undefined") {
      try { return JSON.parse(stored); } catch(e){}
    }
    return { id: Math.floor(Math.random() * 10000).toString(), name: isIntern ? 'Intern' : 'Mentor' };
  });

  // Media Streams & Refs
  const localStreamRef = useRef(null);
  const localScreenStreamRef = useRef(null);
  const localVideoEl = useRef(null);
  
  // WebRTC & WebSockets
  const wsRef = useRef(null);
  const peersRef = useRef({}); 
  
  // Remote State (Live Mesh)
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerStates, setPeerStates] = useState({});
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // When room changes, rejoin WebRTC mesh
    joinChannel();
    return () => {
      leaveChannel();
    };
    // eslint-disable-next-line
  }, [room?.id]);

  useEffect(() => {
    if (localVideoEl.current && localStreamRef.current && connected) {
      localVideoEl.current.srcObject = localScreenStreamRef.current || localStreamRef.current;
    }
  }, [connected, isScreenSharing, isVideoOn]);

  const sendWsMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const broadcastState = (overrides = {}) => {
    sendWsMessage({
      type: "USER_STATE_UPDATE",
      payload: {
        userId: user.id,
        name: user.name || `User ${user.id}`,
        mic: overrides.isMicOn !== undefined ? overrides.isMicOn : isMicOn,
        video: overrides.isVideoOn !== undefined ? overrides.isVideoOn : isVideoOn,
        screenShare: overrides.isScreenSharing !== undefined ? overrides.isScreenSharing : isScreenSharing,
        handRaised: overrides.isHandRaised !== undefined ? overrides.isHandRaised : isHandRaised
      }
    });
  };

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    const streamToUse = localScreenStreamRef.current || localStreamRef.current;
    if (streamToUse) {
      streamToUse.getTracks().forEach(track => pc.addTrack(track, streamToUse));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({ type: "ICE_CANDIDATE", target: targetUserId, sender: user.id, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [targetUserId]: event.streams[0] }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed" || pc.iceConnectionState === "closed") {
        removePeer(targetUserId);
      }
    };

    peersRef.current[targetUserId] = pc;
    return pc;
  };

  const removePeer = (userId) => {
    if (peersRef.current[userId]) {
      peersRef.current[userId].close();
      delete peersRef.current[userId];
    }
    setRemoteStreams(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    setPeerStates(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  const joinChannel = async () => {
    if (!room?.id) return;
    leaveChannel(); // cleanup previous
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      // Initially turn off tracks according to state
      stream.getAudioTracks().forEach(t => t.enabled = isMicOn);
      stream.getVideoTracks().forEach(t => t.enabled = isVideoOn);

      const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
      const wsUri = baseUri.replace(/^http/, 'ws') + `/api/meetings/ws/${room.id}/${user.id}_media`;
      wsRef.current = new WebSocket(wsUri);

      wsRef.current.onopen = () => {
        setConnected(true);
        sendWsMessage({ type: "JOIN", userId: user.id });
        broadcastState();
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const senderId = msg.sender;
        const payload = msg.payload || msg;

        if (senderId === user.id || payload.userId === user.id || payload.sender === user.id || senderId === `${user.id}_media`) return;

        switch (payload.type) {
          case "JOIN":
            if (!peersRef.current[payload.userId]) {
              const pc = createPeerConnection(payload.userId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendWsMessage({ type: "OFFER", target: payload.userId, sender: user.id, sdp: offer });
              broadcastState();
            }
            break;
          case "OFFER":
            if (payload.target === user.id) {
              const pc = createPeerConnection(payload.sender);
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendWsMessage({ type: "ANSWER", target: payload.sender, sender: user.id, sdp: answer });
              broadcastState();
            }
            break;
          case "ANSWER":
            if (payload.target === user.id && peersRef.current[payload.sender]) {
              await peersRef.current[payload.sender].setRemoteDescription(new RTCSessionDescription(payload.sdp));
            }
            break;
          case "ICE_CANDIDATE":
            if (payload.target === user.id && peersRef.current[payload.sender]) {
              try { await peersRef.current[payload.sender].addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch (e) {}
            }
            break;
          case "USER_STATE_UPDATE":
            if (payload.payload) {
              setPeerStates(prev => ({ ...prev, [payload.payload.userId]: payload.payload }));
            }
            break;
          case "HAND_RAISE":
            setPeerStates(prev => ({ ...prev, [payload.userId]: { ...(prev[payload.userId] || {}), handRaised: payload.raised } }));
            break;
          case "EMOJI_REACTION":
            triggerEmoji(payload.userId, payload.emoji);
            break;
          case "USER_DISCONNECTED":
            const rawId = (payload.client_id || payload.userId).toString().replace('_media', '').replace('_sys', '');
            removePeer(rawId);
            break;
          default:
            break;
        }
      };
    } catch (err) {
      console.error("Error joining:", err);
    }
  };

  const leaveChannel = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (localScreenStreamRef.current) localScreenStreamRef.current.getTracks().forEach(t => t.stop());
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    if (wsRef.current) wsRef.current.close();
    setConnected(false);
    setRemoteStreams({});
    setPeerStates({});
  };

  // --- Controls ---
  const toggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = newState;
    }
    broadcastState({ isMicOn: newState });
  };

  const toggleCamera = () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    if (localStreamRef.current && !isScreenSharing) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = newState;
    }
    broadcastState({ isVideoOn: newState });
  };

  const toggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    sendWsMessage({ type: "HAND_RAISE", userId: user.id, raised: newState });
    broadcastState({ isHandRaised: newState });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (localScreenStreamRef.current) localScreenStreamRef.current.getTracks().forEach(t => t.stop());
      localScreenStreamRef.current = null;
      setIsScreenSharing(false);
      
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
      broadcastState({ isScreenSharing: false });
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        localScreenStreamRef.current = displayStream;
        setIsScreenSharing(true);

        const screenTrack = displayStream.getVideoTracks()[0];
        screenTrack.onended = () => {
          localScreenStreamRef.current = null;
          setIsScreenSharing(false);
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            Object.values(peersRef.current).forEach(pc => {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(camTrack);
            });
          }
          broadcastState({ isScreenSharing: false });
        };

        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        broadcastState({ isScreenSharing: true });
      } catch (err) {
        console.error("Screen share failed", err);
      }
    }
  };

  const sendEmoji = (emoji) => {
    triggerEmoji(user.id, emoji);
    sendWsMessage({ type: "EMOJI_REACTION", userId: user.id, emoji });
  };

  const triggerEmoji = (userId, emoji) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, userId, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Layout combined mock + real network peers
  // So they can see the beautifully mocked people, and real people connected via WebRTC
  const liveParticipants = [
    {
      id: user.id,
      name: user.name || (isIntern ? 'Intern' : 'Mentor'),
      isLocal: true,
      micOn: isMicOn,
      camOn: isVideoOn || isScreenSharing,
      handRaised: isHandRaised,
      screenShare: isScreenSharing,
      avatar: (user.name || (isIntern ? 'Intern' : 'Mentor')).substring(0, 2).toUpperCase()
    },
    ...Object.entries(peerStates).map(([uid, state]) => ({
      id: uid,
      name: state.name || `User ${uid}`,
      isLocal: false,
      micOn: state.mic,
      camOn: state.video || state.screenShare,
      handRaised: state.handRaised,
      screenShare: state.screenShare,
      avatar: (state.name || `User ${uid}`).substring(0, 2).toUpperCase(),
      stream: remoteStreams[uid]
    }))
  ];

  const getGridLayout = (count) => {
    if (count <= 1) return 'layout-1';
    if (count === 2) return 'layout-2';
    if (count === 3) return 'layout-3';
    if (count <= 4) return 'layout-4';
    if (count <= 6) return 'layout-6';
    return 'layout-many';
  };

  const layoutClass = getGridLayout(liveParticipants.length);

  return (
    <div className="br-main-area">
      <style>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0px) scale(0.5); }
          20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          80% { opacity: 1; transform: translateY(-60px) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
        }
        .emoji-float {
          position: absolute;
          bottom: 30px;
          right: 20px;
          font-size: 2rem;
          z-index: 20;
          animation: floatUp 2.5s ease-out forwards;
        }
      `}</style>
      <div className="br-main-header">
        <div className="br-header-left">
          <button className="br-icon-btn mobile-only" onClick={toggleLeftPanel} style={{ marginRight: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {room?.name} 
            <span style={{ fontSize: '10px', backgroundColor: '#da373c', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>LIVE</span>
          </span>

          {isIntern && room?.type !== 'main' && (
            <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #10b981' }}>
              ✅ Assigned to {room?.name}
            </span>
          )}
        </div>
        <div className="br-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5c5e66' }}>
            <Users size={18} /> {liveParticipants.length}
          </div>
          {!isIntern && (
            <button className="br-btn br-btn-secondary" onClick={openManager}>
              <LayoutGrid size={18} /> Breakout Rooms
            </button>
          )}
          {onMinimize && (
            <button className="br-icon-btn" onClick={onMinimize} title="Minimize">
              <Minimize size={18} />
            </button>
          )}
          <button className="br-icon-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      <div className="br-video-grid-container">
        <div className={`br-video-grid ${layoutClass}`}>
          {liveParticipants.map((p) => (
            <div key={p.id} className={`br-video-tile ${p.micOn ? 'speaking' : ''}`}>
              {p.camOn ? (
                p.isLocal ? (
                  <video ref={localVideoEl} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <RemoteVideo stream={p.stream} />
                )
              ) : (
                <div className="br-video-avatar">{p.avatar}</div>
              )}
              
              <div className="br-video-overlay" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {p.micOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                {p.name} {p.isLocal ? "(You)" : ""}
                {p.handRaised && <Hand size={14} color="#fbb117" />}
                {p.screenShare && <MonitorUp size={14} color="#60a5fa" />}
              </div>

              {/* Floating Emojis */}
              {floatingEmojis.filter(e => String(e.userId) === String(p.id)).map(e => (
                <span key={e.id} className="emoji-float">{e.emoji}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="br-meeting-controls">
        <button 
          className={`br-control-btn ${!isMicOn ? 'danger' : ''}`} 
          onClick={toggleMic}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button 
          className={`br-control-btn ${!isVideoOn ? 'danger' : ''}`} 
          onClick={toggleCamera}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button 
          className={`br-control-btn ${isScreenSharing ? 'active' : ''}`} 
          onClick={toggleScreenShare}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
        </button>

        <button 
          className={`br-control-btn ${isHandRaised ? 'active' : ''}`} 
          onClick={toggleHandRaise}
        >
          <Hand size={20} color={isHandRaised ? '#fbb117' : 'currentColor'} />
        </button>
        
        {/* Emoji Buttons */}
        <button className="br-control-btn" onClick={() => sendEmoji('👍')} style={{ fontSize: '18px', padding: '10px' }}>👍</button>
        <button className="br-control-btn" onClick={() => sendEmoji('👏')} style={{ fontSize: '18px', padding: '10px' }}>👏</button>

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

// Sub-component for individual remote participants
function RemoteVideo({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}
