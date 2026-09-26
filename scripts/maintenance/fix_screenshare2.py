import os
import re

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Instead of regex, let's just do a clean cut using split
parts1 = content.split("const toggleScreenShare = async () => {")
# Find the next function after toggleScreenShare which is handleHandRaise
parts2 = parts1[1].split("const handleHandRaise = () => {")

new_func = """const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (!screenTrack) return;

        // Apply track to all peers
        for (const pc of Object.values(peerConnectionsRef.current)) {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) await sender.replaceTrack(screenTrack);
        }

        // Apply to local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = async () => {
          screenStream.getTracks().forEach(t => t.stop());
          for (const pc of Object.values(peerConnectionsRef.current)) {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && localStreamRef.current) {
              await sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
            }
          }
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        // Revert manually
        for (const pc of Object.values(peerConnectionsRef.current)) {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender && localStreamRef.current) {
            await sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
          }
        }
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.warn("Screen share error/canceled:", err);
    }
  };

  """

final_content = parts1[0] + new_func + "const handleHandRaise = () => {" + parts2[1]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(final_content)
    
print("Cleanly updated toggleScreenShare")
