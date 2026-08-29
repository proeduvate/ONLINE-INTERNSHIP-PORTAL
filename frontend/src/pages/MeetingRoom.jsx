import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// Agora Configuration
const AGORA_APP_ID = "67f4965fae9f47789a1b564ed3f514dc";
const AGORA_TOKEN = "007eJxTYLDY+23BnizVaR1FsW0nz1072Ctzy3yr4IHGD7/bWHLWCrEpMJiZp5lYmpmmJaZappmYm1tYJhommZqZpKYYp5kamqQkZ6+ZmNUQyMhg1ljIwsgAgSA+G0N5amp2TiUDAwAIRSF7"

// Create Agora Client instance outside component render cycle
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

export default function MeetingRoom({ currentRoom = "weekly", user, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localTracks, setLocalTracks] = useState({ videoTrack: null, audioTrack: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  
  // Track toggle states
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // Reference for local video playback container
  const localVideoRef = useRef(null);

  // Handle Joining Agora Channel
  const joinChannel = async () => {
    try {
      setLoading(true);

      // 1. Subscribe to remote users when published
      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);

        if (mediaType === "video") {
          setRemoteUsers((prev) => {
            const exists = prev.some((u) => u.uid === remoteUser.uid);
            if (exists) return prev;
            return [...prev, remoteUser];
          });
        }

        if (mediaType === "audio") {
          remoteUser.audioTrack?.play();
        }
      });

      // 2. Handle remote users unpublishing or leaving
      client.on("user-unpublished", (remoteUser, mediaType) => {
        if (mediaType === "video") {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
        }
      });

      client.on("user-left", (remoteUser) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
      });

      // 3. Ensure channelName is explicitly passed as a valid string
      const channelName = currentRoom || "weekly-review";

      // 4. Join channel passing null for token and 0/null for user ID
      await client.join(
        AGORA_APP_ID,
        channelName,
        null,
        user?.id || null
      );

      // 5. Capture camera and microphone
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      // 6. Store tracks in local state
      setLocalTracks({ audioTrack: microphoneTrack, videoTrack: cameraTrack });

      // 7. Publish local tracks to channel
      await client.publish([microphoneTrack, cameraTrack]);

      setJoined(true);
    } catch (error) {
      console.error("Error joining video room:", error);
      alert(`Could not join room: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Play local video track once joined and element ref is bound
  useEffect(() => {
    if (joined && localTracks.videoTrack && localVideoRef.current) {
      localTracks.videoTrack.play(localVideoRef.current);
    }
  }, [joined, localTracks.videoTrack]);

  // Handle Disconnecting / Leaving Call
  const leaveChannel = async () => {
    try {
      if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
      }
      if (localTracks.videoTrack) {
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }

      setLocalTracks({ videoTrack: null, audioTrack: null });
      setRemoteUsers([]);
      await client.leave();
      setJoined(false);
      setMicMuted(false);
      setCameraOff(false);

      if (onLeave) onLeave();
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Toggle Microphone Mute State
  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      await localTracks.audioTrack.setMuted(!micMuted);
      setMicMuted(!micMuted);
    }
  };

  // Toggle Camera State
  const toggleCamera = async () => {
    if (localTracks.videoTrack) {
      await localTracks.videoTrack.setMuted(!cameraOff);
      setCameraOff(!cameraOff);
    }
  };

  // Automatic cleanup on unmount
  useEffect(() => {
    return () => {
      leaveChannel();
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Voice Channel: #{currentRoom}</h2>
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
            {loading ? "Connecting to Channel..." : "Join Voice & Video Channel"}
          </button>
        </div>
      ) : (
        <div style={styles.videoGridContainer}>
          <div style={styles.grid}>
            {/* Local Video Stream Tile */}
            <div style={styles.videoCard}>
              <div ref={localVideoRef} style={styles.videoStream} />
              <span style={styles.videoLabel}>You {micMuted ? "(Muted)" : ""}</span>
            </div>

            {/* Remote Video Stream Tiles */}
            {remoteUsers.map((remoteUser) => (
              <RemoteVideoTile key={remoteUser.uid} remoteUser={remoteUser} />
            ))}
          </div>

          {/* Call Controls Bar */}
          <div style={styles.controlsBar}>
            <button
              onClick={toggleMic}
              style={{
                ...styles.controlBtn,
                backgroundColor: micMuted ? "#ef4444" : "#374151"
              }}
            >
              {micMuted ? "Unmute Mic" : "Mute Mic"}
            </button>

            <button
              onClick={toggleCamera}
              style={{
                ...styles.controlBtn,
                backgroundColor: cameraOff ? "#ef4444" : "#374151"
              }}
            >
              {cameraOff ? "Turn Camera On" : "Turn Camera Off"}
            </button>

            <button
              onClick={leaveChannel}
              style={{ ...styles.controlBtn, backgroundColor: "#dc2626" }}
            >
              Leave Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual remote participants
function RemoteVideoTile({ remoteUser }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && remoteUser.videoTrack) {
      remoteUser.videoTrack.play(containerRef.current);
    }
  }, [remoteUser]);

  return (
    <div style={styles.videoCard}>
      <div ref={containerRef} style={styles.videoStream} />
      <span style={styles.videoLabel}>User #{remoteUser.uid}</span>
    </div>
  );
}

// Styled Object Layout
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
  header: {
    marginBottom: "16px"
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#60a5fa"
  },
  preJoinBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px"
  },
  joinBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "background-color 0.2s ease"
  },
  videoGridContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flex: 1
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    flex: 1
  },
  videoCard: {
    backgroundColor: "#000000",
    borderRadius: "8px",
    position: "relative",
    overflow: "hidden",
    height: "260px"
  },
  videoStream: {
    width: "100%",
    height: "100%"
  },
  videoLabel: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem"
  },
  controlsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    paddingTop: "12px"
  },
  controlBtn: {
    color: "#ffffff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: "500"
  }
};