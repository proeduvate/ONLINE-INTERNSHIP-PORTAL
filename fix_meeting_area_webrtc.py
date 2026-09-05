import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"

new_content = """import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Maximize, Minimize, Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Hand, MessageSquare, LogOut, LayoutGrid, Smile, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../services/AuthContext';
import { API_BASE } from '../../api/axios';

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
  const { user } = useAuth();
  
  // Local state
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // WebRTC & WebSocket Refs
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const peerConnectionsRef = useRef({});

  // Networked peer states
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

  // Helper to safely send WS messages
  const sendWsMessage = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    if (!room) return;

    // 1. Initialize local media
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

    // 2. Initialize WebSocket Signaling
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = API_BASE.replace(/^https?:\\/\\//, '');
    const clientId = user?.id || Math.random().toString(36).substring(7);
    
    wsRef.current = new WebSocket(`${wsProtocol}//${backendHost}/api/meetings/ws/${room.id}/${clientId}`);
    
    wsRef.current.onopen = () => {
      console.log("Connected to WebRTC signaling for room", room.id);
      // Let others know our initial state
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
        setPeerStates(prev => ({
          ...prev,
          [sender]: { ...prev[sender], ...data.payload }
        }));
      } else if (data.type === 'reaction') {
        setPeerStates(prev => ({
          ...prev,
          [sender]: { ...prev[sender], reaction: data.payload.emoji }
        }));
        setTimeout(() => {
          setPeerStates(prev => ({
            ...prev,
            [sender]: { ...prev[sender], reaction: null }
          }));
        }, 3000);
      } else if (data.type === 'user-join') {
        // Broadcast our state so the new user knows
        sendWsMessage({
          type: 'state-update',
          micOn: isMicOn,
          videoOn: isVideoOn,
          handRaised: isHandRaised,
          name: user?.name || user?.email || 'User'
        });
        
        // Initialize RTCPeerConnection for the new user
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({ type: 'webrtc', sdp: null, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setPeerStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

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

  // Build the list of active peers from our WS state + mock fallback for layout
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
    // Including self + remote peers
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
            {room?.name || 'Main Room'} 
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

      <div className="br-video-grid-container" style={{ padding: '20px', backgroundColor: '#f3f4f6' }}>
        <div className={`br-video-grid ${layoutClass}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', height: '100%', justifyContent: 'center' }}>
          
          {/* Local User Tile */}
          <div className="br-video-tile" style={{ backgroundColor: '#313338', borderRadius: '8px', overflow: 'hidden', position: 'relative', flex: '1 1 300px', minHeight: '250px' }}>
            {isVideoOn ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4F46E5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                  {(user?.name || user?.email || 'M')[0].toUpperCase()}
                </div>
              </div>
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

            <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              {isMicOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
              {user?.name || 'You'}
            </div>
          </div>

          {/* Remote Peer Tiles */}
          {displayPeers.map(peer => (
            <div key={peer.id} className="br-video-tile" style={{ backgroundColor: '#313338', borderRadius: '8px', overflow: 'hidden', position: 'relative', flex: '1 1 300px', minHeight: '250px' }}>
              {peer.videoOn ? (
                <video 
                  autoPlay 
                  playsInline 
                  ref={el => { if (el && peer.stream) el.srcObject = peer.stream; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4F46E5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                    {peer.name[0].toUpperCase()}
                  </div>
                </div>
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

              <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                {peer.micOn ? <Mic size={14} color="#23a559" /> : <MicOff size={14} color="#da373c" />}
                {peer.name}
              </div>
            </div>
          ))}

        </div>
      </div>

      <div className="br-controls-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px', background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <button onClick={toggleMic} style={{ padding: '12px', borderRadius: '50%', background: isMicOn ? '#fff' : '#DA373C', color: isMicOn ? '#4B5563' : '#fff', border: isMicOn ? '1px solid #D1D5DB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isMicOn ? <Mic size={22}/> : <MicOff size={22}/>}
        </button>
        <button onClick={toggleVideo} style={{ padding: '12px', borderRadius: '50%', background: isVideoOn ? '#fff' : '#DA373C', color: isVideoOn ? '#4B5563' : '#fff', border: isVideoOn ? '1px solid #D1D5DB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isVideoOn ? <Video size={22}/> : <VideoOff size={22}/>}
        </button>
        <button onClick={toggleScreenShare} style={{ padding: '12px', borderRadius: '50%', background: isScreenSharing ? '#4F46E5' : '#fff', color: isScreenSharing ? '#fff' : '#4B5563', border: isScreenSharing ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isScreenSharing ? <MonitorOff size={22}/> : <MonitorUp size={22}/>}
        </button>
        
        <button onClick={handleHandRaise} style={{ padding: '12px', borderRadius: '50%', background: isHandRaised ? '#4F46E5' : '#fff', color: isHandRaised ? '#FBBF24' : '#4B5563', border: isHandRaised ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <Hand size={22}/>
        </button>
        <button onClick={() => handleReaction('thumbsup')} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'thumbsup' ? '#4F46E5' : '#fff', color: activeEmoji === 'thumbsup' ? '#FBBF24' : '#4B5563', border: activeEmoji === 'thumbsup' ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <ThumbsUp size={22}/>
        </button>
        <button onClick={() => handleReaction('smile')} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'smile' ? '#4F46E5' : '#fff', color: activeEmoji === 'smile' ? '#FBBF24' : '#4B5563', border: activeEmoji === 'smile' ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <Smile size={22}/>
        </button>
        
        <button onClick={() => setRightPanelMode(rightPanelMode === 'members' ? null : 'members')} style={{ padding: '12px', borderRadius: '50%', background: rightPanelMode === 'members' ? '#F3F4F6' : '#fff', color: '#4B5563', border: '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <Users size={22}/>
        </button>
        <button onClick={() => setRightPanelMode(rightPanelMode === 'chat' ? null : 'chat')} style={{ padding: '12px', borderRadius: '50%', background: rightPanelMode === 'chat' ? '#F3F4F6' : '#fff', color: '#4B5563', border: '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <MessageSquare size={22}/>
        </button>

        <div style={{ width: '1px', height: '32px', background: '#E5E7EB', margin: '0 5px' }}></div>

        <button onClick={onLeave} style={{ padding: '10px 24px', borderRadius: '8px', background: '#DA373C', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={18}/> Leave
        </button>
      </div>
    </div>
  );
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated MeetingArea.jsx with complete WebRTC and signaling synchronization logic")
