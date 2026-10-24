import os

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the toggleScreenShare block
old_block_pattern = re.compile(r'const toggleScreenShare = async \(\) => \{.*?\};\n', re.DOTALL)

new_block = """const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "always" }, 
          audio: false 
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (!screenTrack) return;

        // Replace tracks in all active peer connections
        for (const pc of Object.values(peerConnectionsRef.current)) {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        // Update local preview to show the screen share
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
      } catch (err) {
        console.error("Error sharing screen (likely aborted by user)", err);
      }
    } else {
      // Manual Stop
      for (const pc of Object.values(peerConnectionsRef.current)) {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && localStreamRef.current) {
          await sender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
        }
      }
      
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        // Optionally stop the screen track if it is attached to the srcObject
      }
      setIsScreenSharing(false);
    }
  };
"""

content = old_block_pattern.sub(new_block, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated screen share logic in MeetingArea.jsx")
