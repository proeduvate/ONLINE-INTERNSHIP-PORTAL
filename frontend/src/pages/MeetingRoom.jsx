import React, { useState, useEffect, useRef } from "react";

// WebRTC Configuration
const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ]
};

export default function MeetingRoom({ currentRoom = "main-meeting", user, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local State
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Media Streams & Refs
  const localStreamRef = useRef(null);
  const localScreenStreamRef = useRef(null);
  const localVideoEl = useRef(null);
  
  // WebRTC & WebSockets
  const wsRef = useRef(null);
  const peersRef = useRef({}); // { [userId]: RTCPeerConnection }
  
  // Remote State
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerStates, setPeerStates] = useState({});
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Initialization & Cleanup
  useEffect(() => {
    return () => {
      leaveChannel();
    };
    // eslint-disable-next-line
  }, []);

  // Update local video element when stream is ready
  useEffect(() => {
    if (localVideoEl.current && localStreamRef.current && joined) {
      localVideoEl.current.srcObject = localScreenStreamRef.current || localStreamRef.current;
    }
  }, [joined, screenShareOn, videoOn]);

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
        mic: overrides.micOn !== undefined ? overrides.micOn : micOn,
        video: overrides.videoOn !== undefined ? overrides.videoOn : videoOn,
        screenShare: overrides.screenShareOn !== undefined ? overrides.screenShareOn : screenShareOn,
        handRaised: overrides.handRaised !== undefined ? overrides.handRaised : handRaised
      }
    });
  };

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    
    // Add local tracks
    const streamToUse = localScreenStreamRef.current || localStreamRef.current;
    if (streamToUse) {
      streamToUse.getTracks().forEach(track => pc.addTrack(track, streamToUse));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWsMessage({
          type: "ICE_CANDIDATE",
          target: targetUserId,
          sender: user.id,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [targetUserId]: event.streams[0]
      }));
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
    try {
      setLoading(true);

      // 1. Get Local Media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      // 2. Connect WebSocket
      const baseUri = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
      const wsUri = baseUri.replace(/^http/, 'ws') + `/api/meetings/ws/${currentRoom}/${user.id}_media`;
      wsRef.current = new WebSocket(wsUri);

      wsRef.current.onopen = () => {
        setJoined(true);
        setLoading(false);
        // Announce presence
        sendWsMessage({ type: "JOIN", userId: user.id });
        broadcastState();
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        const senderId = msg.sender;
        const payload = msg.payload || msg;

        // Ignore our own broadcasts completely if they bounce back
        if (senderId === user.id || payload.userId === user.id || payload.sender === user.id || senderId === `${user.id}_media`) return;

        switch (payload.type) {
          case "JOIN":
            // A new peer joined. We create an offer for them.
            if (!peersRef.current[payload.userId]) {
              const pc = createPeerConnection(payload.userId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendWsMessage({
                type: "OFFER",
                target: payload.userId,
                sender: user.id,
                sdp: offer
              });
              // Send them our state so they know it immediately
              broadcastState();
            }
            break;

          case "OFFER":
            // We received an offer from an existing peer
            if (payload.target === user.id) {
              const pc = createPeerConnection(payload.sender);
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendWsMessage({
                type: "ANSWER",
                target: payload.sender,
                sender: user.id,
                sdp: answer
              });
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
              try {
                await peersRef.current[payload.sender].addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (e) {
                console.error("Error adding received ice candidate", e);
              }
            }
            break;

          case "USER_STATE_UPDATE":
            if (payload.payload) {
              setPeerStates(prev => ({
                ...prev,
                [payload.payload.userId]: payload.payload
              }));
            }
            break;

          case "HAND_RAISE":
            setPeerStates(prev => ({
              ...prev,
              [payload.userId]: { ...(prev[payload.userId] || {}), handRaised: payload.raised }
            }));
            break;

          case "EMOJI_REACTION":
            triggerEmoji(payload.userId, payload.emoji);
            break;

          case "USER_DISCONNECTED":
            // Strip "_media" or "_sys" from client_id
            const rawId = (payload.client_id || payload.userId).toString().replace('_media', '').replace('_sys', '');
            removePeer(rawId);
            break;
            
          default:
            break;
        }
      };

      wsRef.current.onerror = () => {
        setLoading(false);
        alert("WebSocket Error");
      };

    } catch (err) {
      console.error("Error joining:", err);
      alert("Could not access camera/microphone or connect to signaling server.");
      setLoading(false);
    }
  };

  const leaveChannel = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    if (wsRef.current) {
      wsRef.current.close();
    }
    setJoined(false);
    setRemoteStreams({});
    setPeerStates({});
    if (onLeave) onLeave();
  };

  // --- Controls ---

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
        broadcastState({ micOn: audioTrack.enabled });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current && !screenShareOn) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoOn(videoTrack.enabled);
        broadcastState({ videoOn: videoTrack.enabled });
      }
    }
  };

  const toggleHandRaise = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    sendWsMessage({ type: "HAND_RAISE", userId: user.id, raised: newState });
    broadcastState({ handRaised: newState });
  };

  const toggleScreenShare = async () => {
    if (screenShareOn) {
      // Stop screen sharing
      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      localScreenStreamRef.current = null;
      setScreenShareOn(false);
      
      // Revert to camera track
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
      broadcastState({ screenShareOn: false });
    } else {
      // Start screen sharing
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        localScreenStreamRef.current = displayStream;
        setScreenShareOn(true);

        const screenTrack = displayStream.getVideoTracks()[0];
        
        // Listen for browser "Stop Sharing" button
        screenTrack.onended = () => {
          localScreenStreamRef.current = null;
          setScreenShareOn(false);
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            Object.values(peersRef.current).forEach(pc => {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(camTrack);
            });
          }
          broadcastState({ screenShareOn: false });
        };

        // Replace track in all peer connections
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        
        broadcastState({ screenShareOn: true });

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

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0px) scale(0.5); }
          20% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          80% { opacity: 1; transform: translateY(-60px) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
        }
      `}</style>

      <div style={styles.header}>
        <h2 style={styles.title}>Room: {currentRoom}</h2>
      </div>

      {!joined ? (
        <div style={styles.preJoinBox}>
          <button
            onClick={joinChannel}
            disabled={loading}
            style={{
              ...styles.joinBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Connecting..." : "Join Voice & Video Channel"}
          </button>
        </div>
      ) : (
        <div style={styles.mainLayout}>
          {/* Members Panel */}
          <div style={styles.membersPanel}>
            <h4 style={styles.panelTitle}>Participants ({Object.keys(remoteStreams).length + 1})</h4>
            <ul style={styles.memberList}>
              <li style={{ ...styles.memberItem, backgroundColor: handRaised ? '#374151' : 'transparent' }}>
                <span style={{flex: 1}}>You {user?.name ? `(${user.name})` : ""}</span>
                {handRaised && <span style={styles.handIcon}>✋</span>}
                {!micOn && <span>🔇</span>}
              </li>
              {/* Sort remote users: hands raised first */}
              {Object.entries(peerStates)
                .sort(([, a], [, b]) => (b.handRaised ? 1 : 0) - (a.handRaised ? 1 : 0))
                .map(([uid, state]) => (
                <li key={uid} style={{ ...styles.memberItem, backgroundColor: state.handRaised ? '#374151' : 'transparent' }}>
                  <span style={{flex: 1}}>{state.name || `User ${uid}`}</span>
                  {state.handRaised && <span style={styles.handIcon}>✋</span>}
                  {!state.mic && <span>🔇</span>}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.videoGridContainer}>
            <div style={styles.grid}>
              {/* Local Video Stream Tile */}
              <div style={styles.videoCard}>
                {!videoOn && !screenShareOn ? (
                  <div style={styles.avatarPlaceholder}>
                    {user?.name ? user.name.substring(0,2).toUpperCase() : "ME"}
                  </div>
                ) : (
                  <video ref={localVideoEl} autoPlay muted playsInline style={styles.videoStream} />
                )}
                <span style={styles.videoLabel}>You {!micOn ? "🔇" : ""} {handRaised ? "✋" : ""} {screenShareOn ? "💻" : ""}</span>
                
                {floatingEmojis.filter(e => String(e.userId) === String(user.id)).map(e => (
                  <span key={e.id} style={styles.floatingEmoji}>{e.emoji}</span>
                ))}
              </div>

              {/* Remote Video Stream Tiles */}
              {Object.entries(remoteStreams).map(([uid, stream]) => {
                const state = peerStates[uid] || {};
                return (
                  <RemoteVideoTile 
                    key={uid} 
                    uid={uid} 
                    stream={stream} 
                    state={state} 
                    emojis={floatingEmojis.filter(e => String(e.userId) === String(uid))} 
                  />
                );
              })}
            </div>

            {/* Call Controls Bar */}
            <div style={styles.controlsBar}>
              <button onClick={toggleMic} style={{ ...styles.controlBtn, backgroundColor: micOn ? "#374151" : "#ef4444" }}>
                {micOn ? "🎙️ Mute" : "🔇 Unmute"}
              </button>

              <button onClick={toggleCamera} style={{ ...styles.controlBtn, backgroundColor: videoOn ? "#374151" : "#ef4444" }}>
                {videoOn ? "📷 Stop Video" : "📸 Start Video"}
              </button>

              <button onClick={toggleScreenShare} style={{ ...styles.controlBtn, backgroundColor: screenShareOn ? "#10b981" : "#374151" }}>
                {screenShareOn ? "💻 Stop Share" : "🖥️ Share Screen"}
              </button>

              <button onClick={toggleHandRaise} style={{ ...styles.controlBtn, backgroundColor: handRaised ? "#f59e0b" : "#374151" }}>
                {handRaised ? "✋ Lower Hand" : "✋ Raise Hand"}
              </button>

              <button onClick={() => sendEmoji('👍')} style={styles.emojiBtn}>👍</button>
              <button onClick={() => sendEmoji('👏')} style={styles.emojiBtn}>👏</button>

              <div style={{ flex: 1 }}></div>

              <button onClick={leaveChannel} style={{ ...styles.controlBtn, backgroundColor: "#dc2626" }}>
                Leave Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RemoteVideoTile({ uid, stream, state, emojis }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, state.screenShare]); // rebind if streams swap

  return (
    <div style={styles.videoCard}>
      {!state.video && !state.screenShare ? (
        <div style={styles.avatarPlaceholder}>
          {state.name ? state.name.substring(0,2).toUpperCase() : uid.substring(0,2)}
        </div>
      ) : (
        <video ref={videoRef} autoPlay playsInline style={styles.videoStream} />
      )}
      <span style={styles.videoLabel}>
        {state.name || `User ${uid}`} {!state.mic ? "🔇" : ""} {state.handRaised ? "✋" : ""} {state.screenShare ? "💻" : ""}
      </span>

      {emojis.map(e => (
        <span key={e.id} style={styles.floatingEmoji}>{e.emoji}</span>
      ))}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#18181b",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    minHeight: "480px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  header: { marginBottom: "16px" },
  title: { margin: "0", fontSize: "1.5rem", color: "#60a5fa" },
  preJoinBox: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" },
  joinBtn: { backgroundColor: "#4f46e5", color: "#ffffff", border: "none", padding: "14px 28px", fontSize: "1rem", fontWeight: "600", borderRadius: "8px" },
  mainLayout: { display: "flex", gap: "20px", flex: 1 },
  membersPanel: {
    width: "220px",
    backgroundColor: "#000000",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column"
  },
  panelTitle: { margin: "0 0 12px 0", fontSize: "14px", color: "#9ca3af", textTransform: "uppercase" },
  memberList: { listStyle: "none", padding: 0, margin: 0, overflowY: "auto", flex: 1 },
  memberItem: { display: "flex", alignItems: "center", padding: "8px", borderRadius: "4px", fontSize: "14px", marginBottom: "4px" },
  handIcon: { marginRight: "6px" },
  videoGridContainer: { display: "flex", flexDirection: "column", gap: "20px", flex: 1 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", flex: 1 },
  videoCard: { backgroundColor: "#000000", borderRadius: "8px", position: "relative", overflow: "hidden", height: "260px", display: "flex", alignItems: "center", justifyContent: "center" },
  videoStream: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#4b5563", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold" },
  videoLabel: { position: "absolute", bottom: "8px", left: "8px", backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#ffffff", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", zIndex: 10 },
  floatingEmoji: { position: "absolute", bottom: "30px", right: "20px", fontSize: "2rem", zIndex: 20, animation: "floatUp 2.5s ease-out forwards" },
  controlsBar: { display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #333" },
  controlBtn: { color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "6px", fontSize: "0.9rem", cursor: "pointer", fontWeight: "500" },
  emojiBtn: { backgroundColor: "#374151", color: "#fff", border: "none", padding: "10px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }
};