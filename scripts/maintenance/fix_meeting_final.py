import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"

content = """import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Maximize, Minimize, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Hand, MessageSquare, LogOut, LayoutGrid, Smile, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../services/AuthContext';
import { API_BASE } from '../../api';

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
  const { user } = useAuth() || {};
  
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  
  const [peerStates, setPeerStates] = useState({});
  const [peerStreams, setPeerStreams] = useState({});

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const sendWsMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    if (!room) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsMicOn(stream.getAudioTracks()[0]?.enabled || false);
        setIsVideoOn(stream.getVideoTracks()[0]?.enabled || false);
      })
      .catch(err => console.error("Could not get media", err));

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = API_BASE.replace(/^https?:\\/\\//, '');
    const clientId = user?.id || Math.random().toString(36).substring(7);
    
    wsRef.current = new WebSocket(`${wsProtocol}//${backendHost}/api/meetings/ws/${room.id}/${clientId}`);
    
    wsRef.current.onopen = () => {
      sendWsMessage({
        type: 'state-update',
        micOn: isMicOn,
        videoOn: isVideoOn,
        handRaised: isHandRaised,
        name: user?.name || user?.email || 'User'
      });
    };

    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const sender = data.sender;
      if (sender === clientId) return;

      if (data.type === 'state-update') {
        setPeerStates(prev => ({ ...prev, [sender]: { ...prev[sender], ...data.payload } }));
      } else if (data.type === 'reaction') {
        setPeerStates(prev => ({ ...prev, [sender]: { ...prev[sender], reaction: data.payload.emoji } }));
        setTimeout(() => {
          setPeerStates(prev => ({ ...prev, [sender]: { ...prev[sender], reaction: null } }));
        }, 3000);
      } else if (data.type === 'user-join') {
        sendWsMessage({
          type: 'state-update',
          micOn: isMicOn,
          videoOn: isVideoOn,
          handRaised: isHandRaised,
          name: user?.name || user?.email || 'User'
        });
        createPeerConnection(sender);
      } else if (data.type === 'webrtc') {
        handleWebRTCSignal(sender, data.payload);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      setPeerStreams({});
    };
  }, [room?.id]);

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) sendWsMessage({ type: 'webrtc', candidate: event.candidate });
    };
    pc.ontrack = (event) => setPeerStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    peerConnectionsRef.current[peerId] = pc;
    return pc;
  };

  const handleWebRTCSignal = async (peerId, signal) => {
    let pc = peerConnectionsRef.current[peerId];
    if (!pc) pc = createPeerConnection(peerId);
    if (signal.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      if (signal.sdp.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendWsMessage({ type: 'webrtc', sdp: pc.localDescription });
      }
    } else if (signal.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  };

  const toggleMic = () => {
    const newMicState = !isMicOn;
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = newMicState;
    }
    setIsMicOn(newMicState);
    sendWsMessage({ type: 'state-update', micOn: newMicState });
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = newVideoState;
    }
    setIsVideoOn(newVideoState);
    sendWsMessage({ type: 'state-update', videoOn: newVideoState });
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          Object.values(peerConnectionsRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track.kind === 'video');
            if (sender && localStreamRef.current) {
              sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
            }
          });
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        if (sender && localStreamRef.current) {
          sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
        }
      });
      setIsScreenSharing(false);
    }
  };

  const handleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    sendWsMessage({ type: 'state-update', handRaised: newState });
  };

  const handleReaction = (emoji) => {
    setActiveEmoji(emoji);
    sendWsMessage({ type: 'reaction', emoji });
    setTimeout(() => setActiveEmoji(null), 3000);
  };

  const displayPeers = Object.entries(peerStates).map(([id, state]) => ({
    id,
    name: state.name || id,
    micOn: state.micOn,
    videoOn: state.videoOn,
    handRaised: state.handRaised,
    reaction: state.reaction,
    stream: peerStreams[id]
  }));

  const getGridLayout = (count) => {
    const total = count + 1;
    if (total <= 1) return 'layout-1';
    if (total === 2) return 'layout-2';
    if (total === 3) return 'layout-3';
    if (total <= 4) return 'layout-4';
    if (total <= 6) return 'layout-6';
    return 'layout-many';
  };

  const layoutClass = getGridLayout(displayPeers.length);

  return (
    <div className="br-main-area">
      <div className="br-main-header">
        <div className="br-header-left">
          <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {room?.name} 
            <span style={{ fontSize: '10px', backgroundColor: '#da373c', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>LIVE</span>
          </span>
          {isIntern && room?.type !== 'main' && (
            <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px', border: '1px solid #10b981' }}>
              Assigned to {room?.name}
            </span>
          )}
        </div>
        <div className="br-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5c5e66' }}>
            <Users size={18} /> {displayPeers.length + 1}
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
          
          <div className="br-video-tile">
            {isVideoOn ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="br-video-avatar">{(user?.name || user?.email || 'Y')[0].toUpperCase()}</div>
            )}
            
            {isHandRaised && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#4F46E5', padding: '6px', borderRadius: '50%' }}>
                <Hand size={20} color="#FBBF24" />
              </div>
            )}
            {activeEmoji && (
              <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '24px' }}>
                {activeEmoji === 'smile' ? '😄' : '👍'}
              </div>
            )}
            
            <div className="br-video-overlay">
              {isMicOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
              {user?.name || 'You'}
            </div>
          </div>

          {displayPeers.map(peer => (
            <div key={peer.id} className="br-video-tile">
              {peer.videoOn ? (
                <video 
                  autoPlay 
                  playsInline 
                  ref={el => { if (el && peer.stream) el.srcObject = peer.stream; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="br-video-avatar">{peer.name[0].toUpperCase()}</div>
              )}

              {peer.handRaised && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#4F46E5', padding: '6px', borderRadius: '50%' }}>
                  <Hand size={20} color="#FBBF24" />
                </div>
              )}
              {peer.reaction && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '24px' }}>
                  {peer.reaction === 'smile' ? '😄' : '👍'}
                </div>
              )}

              <div className="br-video-overlay">
                {peer.micOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                {peer.name}
              </div>
            </div>
          ))}

        </div>
      </div>

      <div className="br-meeting-controls">
        <button className={`br-control-btn ${!isMicOn ? 'danger' : ''}`} onClick={toggleMic}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button className={`br-control-btn ${!isVideoOn ? 'danger' : ''}`} onClick={toggleVideo}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button className={`br-control-btn ${isScreenSharing ? 'active' : ''}`} onClick={toggleScreenShare}>
          {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
        </button>
        <button className={`br-control-btn ${isHandRaised ? 'active' : ''}`} onClick={handleHandRaise}>
          <Hand size={20} color={isHandRaised ? '#fbb117' : 'currentColor'} />
        </button>
        
        {/* Emojis added directly to controls */}
        <button className={`br-control-btn ${activeEmoji === 'thumbsup' ? 'active' : ''}`} onClick={() => handleReaction('thumbsup')}>
          <ThumbsUp size={20} />
        </button>
        <button className={`br-control-btn ${activeEmoji === 'smile' ? 'active' : ''}`} onClick={() => handleReaction('smile')}>
          <Smile size={20} />
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
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MeetingArea.jsx with all WebRTC logic and UI elements")
