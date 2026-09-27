import os
import re

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new button styles
# White circle with border: background: '#fff', border: '1px solid #D1D5DB', color: '#4B5563'
# Red circle: background: '#DA373C', border: 'none', color: '#fff'
# Blue circle: background: '#4F46E5', border: 'none', color: '#FBBF24'

# Let's replace the whole controls bar
controls_replacement = """<div className="br-controls-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px', background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <button onClick={toggleMic} style={{ padding: '12px', borderRadius: '50%', background: isMicOn ? '#fff' : '#DA373C', color: isMicOn ? '#4B5563' : '#fff', border: isMicOn ? '1px solid #D1D5DB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isMicOn ? <Mic size={22}/> : <MicOff size={22}/>}
        </button>
        <button onClick={toggleVideo} style={{ padding: '12px', borderRadius: '50%', background: isVideoOn ? '#fff' : '#DA373C', color: isVideoOn ? '#4B5563' : '#fff', border: isVideoOn ? '1px solid #D1D5DB' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isVideoOn ? <Video size={22}/> : <VideoOff size={22}/>}
        </button>
        <button onClick={toggleScreenShare} style={{ padding: '12px', borderRadius: '50%', background: isScreenSharing ? '#4F46E5' : '#fff', color: isScreenSharing ? '#fff' : '#4B5563', border: isScreenSharing ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          {isScreenSharing ? <MonitorOff size={22}/> : <MonitorUp size={22}/>}
        </button>
        
        <button onClick={() => setIsHandRaised(!isHandRaised)} style={{ padding: '12px', borderRadius: '50%', background: isHandRaised ? '#4F46E5' : '#fff', color: isHandRaised ? '#FBBF24' : '#4B5563', border: isHandRaised ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <Hand size={22}/>
        </button>
        <button onClick={() => { setActiveEmoji('thumbsup'); setTimeout(() => setActiveEmoji(null), 2000); }} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'thumbsup' ? '#4F46E5' : '#fff', color: activeEmoji === 'thumbsup' ? '#FBBF24' : '#4B5563', border: activeEmoji === 'thumbsup' ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
          <ThumbsUp size={22}/>
        </button>
        <button onClick={() => { setActiveEmoji('smile'); setTimeout(() => setActiveEmoji(null), 2000); }} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'smile' ? '#4F46E5' : '#fff', color: activeEmoji === 'smile' ? '#FBBF24' : '#4B5563', border: activeEmoji === 'smile' ? 'none' : '1px solid #D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
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
      </div>"""

# Replace the existing controls bar
content = re.sub(r'<div className="br-controls-bar".*?</div>\s*</div>', controls_replacement + "\n    </div>", content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated meeting area controls to match new mockup")
