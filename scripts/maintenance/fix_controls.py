import os
import re

filepath = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix state initializations
content = content.replace("const [isMicOn, setIsMicOn] = useState(false);", "const [isMicOn, setIsMicOn] = useState(true);")
content = content.replace("const [isVideoOn, setIsVideoOn] = useState(false);", "const [isVideoOn, setIsVideoOn] = useState(true);")

# 2. Add new icons to imports
if "Smile, ThumbsUp, Hand" not in content:
    content = content.replace(
        "} from 'lucide-react';", 
        ", Smile, ThumbsUp, Hand } from 'lucide-react';"
    )
    # wait, 'Hand' might already be there. Let's just do regex replacement
    # Actually, we can just replace 'lucide-react' import completely to be safe.

# Let's fix the imports safely
content = re.sub(r'import\s+\{([^}]*)\}\s+from\s+\'lucide-react\';', 
    lambda m: f"import {{{m.group(1)}, Smile, ThumbsUp}} from 'lucide-react';" if 'Smile' not in m.group(1) else m.group(0), 
    content)

# Make sure Hand is in there
if "Hand" not in content[:content.find("'lucide-react'")]:
    content = content.replace("Smile, ThumbsUp", "Smile, ThumbsUp, Hand")

# 3. Add states for Hand raise and emojis (just simple UI for now)
if "const [isHandRaised" not in content:
    state_addition = """const [chatInput, setChatInput] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeEmoji, setActiveEmoji] = useState(null);"""
    content = content.replace("const [chatInput, setChatInput] = useState('');", state_addition)

# 4. Update the controls bar
controls_original = """<div className="br-controls-bar" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={toggleMic} style={{ padding: '10px', borderRadius: '50%', background: isMicOn ? '#23A559' : '#DA373C', color: '#333', border: 'none' }}>
          {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
        </button>
        <button onClick={toggleVideo} style={{ padding: '10px', borderRadius: '50%', background: isVideoOn ? '#23A559' : '#DA373C', color: '#333', border: 'none' }}>
          {isVideoOn ? <Video size={20}/> : <VideoOff size={20}/>}
        </button>
        <button onClick={toggleScreenShare} style={{ padding: '10px', borderRadius: '50%', background: isScreenSharing ? '#23A559' : '#4E5058', color: '#333', border: 'none' }}>
          {isScreenSharing ? <MonitorOff size={20}/> : <MonitorUp size={20}/>}
        </button>
        <button onClick={onLeave} style={{ padding: '10px 20px', borderRadius: '20px', background: '#DA373C', color: '#333', border: 'none', fontWeight: 'bold' }}>
          Leave Meeting
        </button>
      </div>"""

# Ensure white icon color instead of #333 for the circle buttons, and #fff for the Leave button
controls_replacement = """<div className="br-controls-bar" style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '15px', background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <button onClick={toggleMic} style={{ padding: '12px', borderRadius: '50%', background: isMicOn ? '#4E5058' : '#DA373C', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isMicOn ? <Mic size={22}/> : <MicOff size={22}/>}
        </button>
        <button onClick={toggleVideo} style={{ padding: '12px', borderRadius: '50%', background: isVideoOn ? '#4E5058' : '#DA373C', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isVideoOn ? <Video size={22}/> : <VideoOff size={22}/>}
        </button>
        <button onClick={toggleScreenShare} style={{ padding: '12px', borderRadius: '50%', background: isScreenSharing ? '#23A559' : '#4E5058', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isScreenSharing ? <MonitorOff size={22}/> : <MonitorUp size={22}/>}
        </button>
        
        <div style={{ width: '1px', background: '#E5E7EB', margin: '0 5px' }}></div>
        
        <button onClick={() => setIsHandRaised(!isHandRaised)} style={{ padding: '12px', borderRadius: '50%', background: isHandRaised ? '#F59E0B' : '#4E5058', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <Hand size={22}/>
        </button>
        <button onClick={() => { setActiveEmoji('thumbsup'); setTimeout(() => setActiveEmoji(null), 2000); }} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'thumbsup' ? '#3B82F6' : '#4E5058', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <ThumbsUp size={22}/>
        </button>
        <button onClick={() => { setActiveEmoji('smile'); setTimeout(() => setActiveEmoji(null), 2000); }} style={{ padding: '12px', borderRadius: '50%', background: activeEmoji === 'smile' ? '#3B82F6' : '#4E5058', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <Smile size={22}/>
        </button>

        <div style={{ width: '1px', background: '#E5E7EB', margin: '0 5px' }}></div>

        <button onClick={onLeave} style={{ padding: '10px 24px', borderRadius: '24px', background: '#DA373C', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          Leave Meeting
        </button>
      </div>"""

content = re.sub(r'<div className="br-controls-bar".*?</div>\s*</div>', controls_replacement + "\n    </div>", content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated meeting area controls")
