import os
import re

ws_file = "frontend/src/pages/breakout-rooms/WorkspaceSidebar.jsx"
try:
    with open(ws_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # fix the lock icon mojibake
    content = content.replace("'dY\"''", "'🔒'")
    
    with open(ws_file, 'w', encoding='utf-8') as f:
        f.write(content)
except Exception as e:
    pass

ma_file = "frontend/src/pages/breakout-rooms/MeetingArea.jsx"
try:
    with open(ma_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's replace the simplistic peer map with one that shows Avatars!
    # Original:
    # {peers.map(peer => (
    #   <div key={peer.id} style={{ width: '48%', minHeight: '200px', backgroundColor: 'black', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
    #     <VideoPlayer stream={peer.stream} />
    #     <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>
    #       User {peer.id}
    #     </div>
    #   </div>
    # ))}
    
    replacement = """
          {/* Remote Videos */}
          {peers.map(peer => {
            const hasVideo = peer.stream && peer.stream.getVideoTracks().length > 0 && peer.stream.getVideoTracks()[0].enabled;
            const peerInitial = peer.id ? peer.id.charAt(0).toUpperCase() : 'U';
            return (
            <div key={peer.id} style={{ width: '32%', minHeight: '240px', backgroundColor: hasVideo ? '#3B3D42' : '#F0F2F5', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: hasVideo ? 'none' : '2px solid #D1D5DB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              
              {hasVideo ? (
                <>
                  <VideoPlayer stream={peer.stream} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '14px', zIndex: 1 }}>[Video Feed]</div>
                </>
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4F46E5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                  {peerInitial}
                </div>
              )}
              
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#333', background: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 <div style={{ color: '#DA373C' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                 </div>
                 <span style={{ fontWeight: 600 }}>{peer.id}</span>
              </div>
            </div>
          )})}
"""
    # Replace the exact peers.map section
    content = re.sub(r'\{\s*peers\.map\(peer => \(.*?</div>\s*\)\s*\}\s*\)\s*\}', replacement, content, flags=re.DOTALL)
    
    # Similarly update the Local Video part to match the design style
    local_replacement = """
          {/* Local Video */}
          <div style={{ width: '32%', minHeight: '240px', backgroundColor: isVideoOn ? '#3B3D42' : '#F0F2F5', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: isVideoOn ? 'none' : '2px solid #D1D5DB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isVideoOn ? (
               <>
                 <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: '14px', zIndex: 1 }}>[Video Feed]</div>
               </>
            ) : (
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#4F46E5', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                  {user ? user.charAt(0).toUpperCase() : 'M'}
               </div>
            )}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#333', background: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 <div style={{ color: isMicOn ? '#23A559' : '#DA373C' }}>
                    {isMicOn ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    )}
                 </div>
                 <span style={{ fontWeight: 600 }}>{user || 'Me'}</span>
              </div>
          </div>
"""
    content = re.sub(r'\{/\*\s*Local Video\s*\*/\}.*?<div style=\{\{\s*position:\s*\'absolute\',\s*bottom:\s*\'10px\',\s*left:\s*\'10px\'.*?</div>\s*</div>', local_replacement, content, flags=re.DOTALL)

    # Also change the overall container background from '#1E1F22' to white to match the screenshot
    content = content.replace("backgroundColor: '#1E1F22'", "backgroundColor: '#fff'")
    content = content.replace("background: '#2B2D31'", "background: '#fff', borderBottom: '1px solid #E5E7EB'")
    content = content.replace("color: 'white'", "color: '#333'")
    
    with open(ma_file, 'w', encoding='utf-8') as f:
        f.write(content)

except Exception as e:
    print(e)
