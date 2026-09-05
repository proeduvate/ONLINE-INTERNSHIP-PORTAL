import os
import re

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix toggleMic
old_mic = """  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };"""
new_mic = """  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
      }
    }
    setIsMicOn(!isMicOn);
  };"""
content = content.replace(old_mic, new_mic)

# Fix toggleVideo
old_vid = """  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };"""
new_vid = """  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
      }
    }
    setIsVideoOn(!isVideoOn);
  };"""
content = content.replace(old_vid, new_vid)

# Fix colors of the buttons to exactly match the dark grey in the screenshot, regardless of state
# Background: always '#4E5058' unless it's screen share active or hand active etc.
content = content.replace("background: isMicOn ? '#4E5058' : '#DA373C'", "background: '#4E5058'")
content = content.replace("background: isVideoOn ? '#4E5058' : '#DA373C'", "background: '#4E5058'")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed toggle state bugs and button colors")
